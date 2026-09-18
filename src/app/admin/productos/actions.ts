"use server";

import { revalidatePath } from "next/cache";
import {
  generateId,
  getCategories,
  getProducts,
  getVariantGroups,
  saveProducts,
  slugify,
} from "@/lib/data";
import {
  MAX_PIECE_FORMATS,
  MAX_VARIANT_SLOTS,
  resolveProductCode,
  uniqueSlug,
} from "@/lib/product-helpers";
import { saveUploadedImage } from "@/lib/uploads";
import {
  COOKING_METHODS,
  type CookingMethod,
  type PieceFormat,
  type Product,
  type ProductVariantSelection,
  type Unit,
} from "@/lib/types";

function parseCookingMethodsField(formData: FormData): CookingMethod[] {
  const set = new Set(COOKING_METHODS);
  return formData
    .getAll("cookingMethods")
    .map(String)
    .filter((m): m is CookingMethod => set.has(m as CookingMethod));
}

function revalidatePublicPages() {
  revalidatePath("/admin/productos");
  revalidatePath("/");
  revalidatePath("/tienda");
}

async function parseVariantFields(
  formData: FormData
): Promise<{ variantSelections: ProductVariantSelection[] }> {
  const groups = await getVariantGroups();
  const selections: ProductVariantSelection[] = [];
  const usedGroupIds = new Set<string>();

  for (let i = 0; i < MAX_VARIANT_SLOTS; i++) {
    const groupId = String(formData.get(`variantGroupId_${i}`) || "");
    if (!groupId) continue;

    const group = groups.find((g) => g.id === groupId);
    if (!group) throw new Error("Variante no encontrada.");
    if (usedGroupIds.has(groupId)) {
      throw new Error(`No podés elegir "${group.name}" dos veces en el mismo producto.`);
    }
    usedGroupIds.add(groupId);

    const validKeys = new Set(group.options.map((o) => o.key));
    const optionKeys = formData
      .getAll(`variantOptionKeys_${i}`)
      .map(String)
      .filter((key) => validKeys.has(key));

    const optionNotes: Record<string, string> = {};
    for (const key of optionKeys) {
      const note = String(formData.get(`optionNote_${i}_${key}`) || "").trim();
      if (note) optionNotes[key] = note;
    }

    selections.push({ groupId, optionKeys, optionNotes });
  }

  return { variantSelections: selections };
}

function parsePieceFormatFields(
  formData: FormData,
  unit: Unit
): {
  pieceFormats: PieceFormat[];
  offerLoose: boolean;
} {
  const pieceFormats: PieceFormat[] = [];

  for (let i = 0; i < MAX_PIECE_FORMATS; i++) {
    const label = String(formData.get(`pieceFormatLabel_${i}`) || "").trim();
    if (!label) continue;

    const kgRaw = String(formData.get(`pieceFormatKg_${i}`) || "").trim();
    const approxKg = Number(kgRaw);
    if (!kgRaw || !Number.isFinite(approxKg) || approxKg <= 0) {
      throw new Error(`El formato "${label}" necesita un peso aproximado mayor a 0.`);
    }

    pieceFormats.push({ id: `pf-${i}-${slugify(label)}`, label, approxKg });
  }

  if (pieceFormats.length > 0 && unit !== "kg") {
    // Always priced by real weight, whatever the format — a format's total
    // is price (per kg) * approxKg, which only exists when unit === "kg".
    throw new Error(
      'Los formatos de venta (pieza entera, trozo, bolsa, etc.) necesitan que la unidad sea "Por kg" — se calculan a partir del precio por kilo, siempre se termina cobrando por peso real.'
    );
  }

  // With no fixed formats at all, "vender suelto por kg" is the only way
  // to buy this product either way — the checkbox is moot, so a product
  // never ends up accidentally unsellable no matter its default state.
  const offerLoose = pieceFormats.length === 0 ? true : formData.get("offerLoose") === "on";

  return { pieceFormats, offerLoose };
}

export type ProductFormState = { error?: string };

export async function upsertProduct(
  _prevState: ProductFormState,
  formData: FormData
): Promise<ProductFormState> {
  try {
    const id = String(formData.get("id") || "");
    const code = String(formData.get("code") || "").trim().toUpperCase();
    const name = String(formData.get("name") || "").trim();
    const categoryId = String(formData.get("categoryId") || "");
    const unit = (String(formData.get("unit") || "kg") as Unit) === "unidad" ? "unidad" : "kg";
    const price = Number(formData.get("price") || 0);
    const description = String(formData.get("description") || "").trim();
    const active = formData.get("active") === "on";
    const featured = formData.get("featured") === "on";
    const removeImage = formData.get("removeImage") === "on";
    const imageFile = formData.get("image") as File | null;
    const approxWeightKgRaw = String(formData.get("approxWeightKg") || "").trim();
    const approxWeightKg = approxWeightKgRaw ? Number(approxWeightKgRaw) : undefined;
    if (approxWeightKgRaw && (!Number.isFinite(approxWeightKg) || (approxWeightKg as number) <= 0)) {
      throw new Error("El peso aproximado tiene que ser un número mayor a 0.");
    }

    if (!name) throw new Error("El nombre es obligatorio.");

    const categories = await getCategories();
    if (!categories.some((c) => c.id === categoryId)) {
      throw new Error("Elegí una categoría válida.");
    }

    const products = await getProducts();
    const uploadedUrl = await saveUploadedImage(imageFile);
    const variantFields = await parseVariantFields(formData);
    const cookingMethods = parseCookingMethodsField(formData);
    const { pieceFormats, offerLoose } = parsePieceFormatFields(formData, unit);

    if (id) {
      const index = products.findIndex((p) => p.id === id);
      if (index === -1) throw new Error("Producto no encontrado.");
      const existing = products[index];
      products[index] = {
        ...existing,
        code: resolveProductCode(code, products, id),
        name,
        categoryId,
        unit,
        price: Number.isFinite(price) ? price : existing.price,
        description,
        active,
        featured,
        cookingMethods,
        approxWeightKg,
        pieceFormats,
        offerLoose,
        imageUrl: uploadedUrl ?? (removeImage ? "" : existing.imageUrl),
        ...variantFields,
      };
    } else {
      const slug = uniqueSlug(slugify(name), products);
      const maxOrder = products
        .filter((p) => p.categoryId === categoryId)
        .reduce((max, p) => Math.max(max, p.order), 0);
      const newProduct: Product = {
        id: generateId("p"),
        slug,
        code: resolveProductCode(code, products),
        name,
        categoryId,
        unit,
        price: Number.isFinite(price) ? price : 0,
        description,
        imageUrl: uploadedUrl ?? "",
        active,
        featured,
        cookingMethods,
        approxWeightKg,
        pieceFormats,
        offerLoose,
        order: maxOrder + 1,
        ...variantFields,
      };
      products.push(newProduct);
    }

    await saveProducts(products);
    revalidatePublicPages();
    return {};
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Ocurrió un error inesperado." };
  }
}

export async function deleteProduct(formData: FormData) {
  const id = String(formData.get("id") || "");
  const products = await getProducts();
  await saveProducts(products.filter((p) => p.id !== id));
  revalidatePublicPages();
}

export async function moveProduct(formData: FormData) {
  const id = String(formData.get("id") || "");
  const direction = String(formData.get("direction") || "");
  const products = await getProducts(); // already sorted by order

  const product = products.find((p) => p.id === id);
  if (!product) return;

  // Order is only meaningful relative to siblings in the same category
  // (that's the list a shopper actually browses), so reordering swaps
  // within that category rather than across the whole catalog.
  const siblings = products.filter((p) => p.categoryId === product.categoryId);
  const index = siblings.findIndex((p) => p.id === id);
  const swapWith = direction === "up" ? index - 1 : index + 1;
  if (index === -1 || swapWith < 0 || swapWith >= siblings.length) return;

  const a = siblings[index];
  const b = siblings[swapWith];
  const orderA = a.order;
  const orderB = b.order;

  const updated = products.map((p) => {
    if (p.id === a.id) return { ...p, order: orderB };
    if (p.id === b.id) return { ...p, order: orderA };
    return p;
  });

  await saveProducts(updated);
  revalidatePublicPages();
}
