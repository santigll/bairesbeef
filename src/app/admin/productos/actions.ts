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
import { resolveProductCode, uniqueSlug } from "@/lib/product-helpers";
import { saveUploadedImage } from "@/lib/uploads";
import type { Product, Unit } from "@/lib/types";

function revalidatePublicPages() {
  revalidatePath("/admin/productos");
  revalidatePath("/");
  revalidatePath("/tienda");
}

async function parseVariantFields(formData: FormData): Promise<{
  variantGroupId?: string;
  variantOptionKeys?: string[];
  optionNotes?: Record<string, string>;
}> {
  const variantGroupId = String(formData.get("variantGroupId") || "");
  if (!variantGroupId) {
    return { variantGroupId: undefined, variantOptionKeys: undefined, optionNotes: undefined };
  }

  const groups = await getVariantGroups();
  const group = groups.find((g) => g.id === variantGroupId);
  if (!group) {
    throw new Error("Variante no encontrada.");
  }

  const validKeys = new Set(group.options.map((o) => o.key));
  const variantOptionKeys = formData
    .getAll("variantOptionKeys")
    .map(String)
    .filter((key) => validKeys.has(key));

  const optionNotes: Record<string, string> = {};
  for (const key of variantOptionKeys) {
    const note = String(formData.get(`optionNote_${key}`) || "").trim();
    if (note) optionNotes[key] = note;
  }

  return { variantGroupId, variantOptionKeys, optionNotes };
}

export async function upsertProduct(formData: FormData) {
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

  if (!name) throw new Error("El nombre es obligatorio.");

  const categories = await getCategories();
  if (!categories.some((c) => c.id === categoryId)) {
    throw new Error("Elegí una categoría válida.");
  }

  const products = await getProducts();
  const uploadedUrl = await saveUploadedImage(imageFile);
  const variantFields = await parseVariantFields(formData);

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
      order: maxOrder + 1,
      ...variantFields,
    };
    products.push(newProduct);
  }

  await saveProducts(products);
  revalidatePublicPages();
}

export async function deleteProduct(formData: FormData) {
  const id = String(formData.get("id") || "");
  const products = await getProducts();
  await saveProducts(products.filter((p) => p.id !== id));
  revalidatePublicPages();
}
