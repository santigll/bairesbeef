"use server";

import { revalidatePath } from "next/cache";
import {
  generateId,
  getCategories,
  getProducts,
  saveProducts,
  slugify,
} from "@/lib/data";
import { saveUploadedImage } from "@/lib/uploads";
import type { Product, Unit } from "@/lib/types";

function revalidatePublicPages() {
  revalidatePath("/admin/productos");
  revalidatePath("/");
  revalidatePath("/tienda");
}

async function uniqueSlug(base: string, products: Product[], ignoreId?: string) {
  const taken = new Set(
    products.filter((p) => p.id !== ignoreId).map((p) => p.slug)
  );
  let slug = base || "producto";
  let i = 2;
  while (taken.has(slug)) {
    slug = `${base}-${i}`;
    i += 1;
  }
  return slug;
}

export async function upsertProduct(formData: FormData) {
  const id = String(formData.get("id") || "");
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

  if (id) {
    const index = products.findIndex((p) => p.id === id);
    if (index === -1) throw new Error("Producto no encontrado.");
    const existing = products[index];
    products[index] = {
      ...existing,
      name,
      categoryId,
      unit,
      price: Number.isFinite(price) ? price : existing.price,
      description,
      active,
      featured,
      imageUrl: uploadedUrl ?? (removeImage ? "" : existing.imageUrl),
    };
  } else {
    const slug = await uniqueSlug(slugify(name), products);
    const maxOrder = products
      .filter((p) => p.categoryId === categoryId)
      .reduce((max, p) => Math.max(max, p.order), 0);
    const newProduct: Product = {
      id: generateId("p"),
      slug,
      name,
      categoryId,
      unit,
      price: Number.isFinite(price) ? price : 0,
      description,
      imageUrl: uploadedUrl ?? "",
      active,
      featured,
      order: maxOrder + 1,
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
