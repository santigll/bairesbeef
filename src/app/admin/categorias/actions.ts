"use server";

import { revalidatePath } from "next/cache";
import {
  generateId,
  getCategories,
  getProducts,
  saveCategories,
  slugify,
} from "@/lib/data";

function revalidatePublicPages() {
  revalidatePath("/admin/categorias");
  revalidatePath("/");
  revalidatePath("/tienda");
}

export async function upsertCategory(formData: FormData) {
  const id = String(formData.get("id") || "");
  const name = String(formData.get("name") || "").trim();
  if (!name) throw new Error("El nombre es obligatorio.");

  const categories = await getCategories();

  if (id) {
    const index = categories.findIndex((c) => c.id === id);
    if (index === -1) throw new Error("Categoría no encontrada.");
    categories[index] = { ...categories[index], name };
  } else {
    const maxOrder = categories.reduce((max, c) => Math.max(max, c.order), 0);
    categories.push({
      id: generateId("cat"),
      slug: slugify(name),
      name,
      order: maxOrder + 1,
    });
  }

  await saveCategories(categories);
  revalidatePublicPages();
}

export async function deleteCategory(formData: FormData) {
  const id = String(formData.get("id") || "");
  const [categories, products] = await Promise.all([getCategories(), getProducts()]);

  if (products.some((p) => p.categoryId === id)) {
    return; // guarded in the UI: only offered when the category is empty
  }

  await saveCategories(categories.filter((c) => c.id !== id));
  revalidatePublicPages();
}

export async function moveCategory(formData: FormData) {
  const id = String(formData.get("id") || "");
  const direction = String(formData.get("direction") || "");
  const categories = await getCategories();

  const index = categories.findIndex((c) => c.id === id);
  const swapWith = direction === "up" ? index - 1 : index + 1;
  if (index === -1 || swapWith < 0 || swapWith >= categories.length) return;

  const orderA = categories[index].order;
  const orderB = categories[swapWith].order;
  categories[index].order = orderB;
  categories[swapWith].order = orderA;

  await saveCategories(categories);
  revalidatePublicPages();
}
