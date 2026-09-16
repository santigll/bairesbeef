"use server";

import { revalidatePath } from "next/cache";
import {
  generateId,
  getCategories,
  getProducts,
  saveCategories,
  saveProducts,
  slugify,
} from "@/lib/data";
import { parseCsvRows } from "@/lib/csv";
import { generateCode, uniqueCode } from "@/lib/product-helpers";
import type { Product, Unit } from "@/lib/types";

export type ImportResult = {
  created: number;
  updated: number;
  errors: string[];
};

function parseBool(value: string, fallback: boolean): boolean {
  const v = value.trim().toLowerCase();
  if (!v) return fallback;
  return ["si", "sí", "true", "1", "yes"].includes(v);
}

export async function importProducts(
  _prevState: ImportResult,
  formData: FormData
): Promise<ImportResult> {
  const file = formData.get("file") as File | null;
  if (!file || file.size === 0) {
    return { created: 0, updated: 0, errors: ["No se seleccionó ningún archivo."] };
  }

  const text = await file.text();
  const rows = parseCsvRows(text);
  if (rows.length === 0) {
    return {
      created: 0,
      updated: 0,
      errors: ["El archivo está vacío o no tiene el formato esperado."],
    };
  }

  const products = await getProducts();
  const categories = await getCategories();
  const categoriesByName = new Map(categories.map((c) => [c.name.trim().toLowerCase(), c]));
  const nextOrderByCategory = new Map<string, number>();
  for (const p of products) {
    nextOrderByCategory.set(
      p.categoryId,
      Math.max(nextOrderByCategory.get(p.categoryId) ?? 0, p.order)
    );
  }
  let categoriesChanged = false;

  let created = 0;
  let updated = 0;
  const errors: string[] = [];

  rows.forEach((row, i) => {
    const line = i + 2; // header is line 1
    const codigo = String(row.codigo || "").trim().toUpperCase();
    const nombre = String(row.nombre || "").trim();
    const categoriaNombre = String(row.categoria || "").trim();
    const precioRaw = String(row.precio || "").trim().replace(",", ".");
    const unidadRaw = String(row.unidad || "kg").trim().toLowerCase();
    const descripcion = String(row.descripcion || "").trim();

    if (!nombre) {
      errors.push(`Fila ${line}: falta el nombre.`);
      return;
    }

    const precio = Number(precioRaw);
    if (!precioRaw || !Number.isFinite(precio) || precio < 0) {
      errors.push(`Fila ${line} (${nombre}): precio inválido ("${row.precio ?? ""}").`);
      return;
    }

    let unit: Unit;
    if (unidadRaw === "kg" || unidadRaw === "unidad") {
      unit = unidadRaw;
    } else {
      errors.push(
        `Fila ${line} (${nombre}): unidad inválida ("${row.unidad ?? ""}"), usá "kg" o "unidad".`
      );
      return;
    }

    if (!categoriaNombre) {
      errors.push(`Fila ${line} (${nombre}): falta la categoría.`);
      return;
    }

    let category = categoriesByName.get(categoriaNombre.toLowerCase());
    if (!category) {
      category = {
        id: generateId("cat"),
        slug: slugify(categoriaNombre),
        name: categoriaNombre,
        order: categories.length + 1,
      };
      categories.push(category);
      categoriesByName.set(categoriaNombre.toLowerCase(), category);
      categoriesChanged = true;
    }
    const categoryId = category.id;

    const active = parseBool(String(row.activo ?? ""), true);
    const featured = parseBool(String(row.destacado ?? ""), false);

    const existingIndex = codigo ? products.findIndex((p) => p.code === codigo) : -1;

    if (existingIndex >= 0) {
      const existing = products[existingIndex];
      products[existingIndex] = {
        ...existing,
        name: nombre,
        categoryId,
        unit,
        price: precio,
        description: descripcion,
        active,
        featured,
      };
      updated += 1;
    } else {
      const order = (nextOrderByCategory.get(categoryId) ?? 0) + 1;
      nextOrderByCategory.set(categoryId, order);

      const newProduct: Product = {
        id: generateId("p"),
        slug: slugify(nombre) || generateId("producto"),
        code: uniqueCode(codigo || generateCode(), products),
        name: nombre,
        categoryId,
        unit,
        price: precio,
        description: descripcion,
        imageUrl: "",
        active,
        featured,
        order,
      };
      products.push(newProduct);
      created += 1;
    }
  });

  await Promise.all([
    saveProducts(products),
    categoriesChanged ? saveCategories(categories) : Promise.resolve(),
  ]);

  revalidatePath("/admin/productos");
  revalidatePath("/admin/categorias");
  revalidatePath("/");
  revalidatePath("/tienda");

  return { created, updated, errors };
}
