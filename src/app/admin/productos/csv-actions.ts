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
import { parseCookingMethods, parseCsvRows, pick } from "@/lib/csv";
import { generateCode, uniqueCode } from "@/lib/product-helpers";
import type { Product, Unit } from "@/lib/types";

export type ImportResult = {
  created: number;
  updated: number;
  deleted: number;
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
  const replaceAll = formData.get("replaceAll") === "on";
  if (!file || file.size === 0) {
    return { created: 0, updated: 0, deleted: 0, errors: ["No se seleccionó ningún archivo."] };
  }

  const text = await file.text();
  const rows = parseCsvRows(text);
  if (rows.length === 0) {
    return {
      created: 0,
      updated: 0,
      deleted: 0,
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
  const touchedCodes = new Set<string>();

  rows.forEach((row, i) => {
    const line = i + 2; // header is line 1
    const codigo = pick(row, ["codigo", "código", "code", "sku"]).toUpperCase();
    const nombre = pick(row, ["nombre", "corte", "producto", "name"]);
    const categoriaNombre = pick(row, ["categoria", "categoría", "especie", "category"]);
    const precioRaw = pick(row, ["precio", "price"]).replace(",", ".");
    const unidadRaw = pick(row, ["unidad", "unit"]).toLowerCase();
    const descripcion = pick(row, ["descripcion", "descripción", "description"]);

    if (!nombre) {
      errors.push(`Fila ${line}: falta el nombre (columna "nombre" o "corte").`);
      return;
    }

    const precio = Number(precioRaw);
    if (!precioRaw || !Number.isFinite(precio) || precio < 0) {
      errors.push(`Fila ${line} (${nombre}): precio inválido ("${precioRaw}").`);
      return;
    }

    // No column, or blank: most cuts sell by weight, so default to kg
    // instead of rejecting the row.
    let unit: Unit;
    if (!unidadRaw || unidadRaw === "kg") {
      unit = "kg";
    } else if (unidadRaw === "unidad") {
      unit = "unidad";
    } else {
      errors.push(`Fila ${line} (${nombre}): unidad inválida ("${unidadRaw}"), usá "kg" o "unidad".`);
      return;
    }

    if (!categoriaNombre) {
      errors.push(`Fila ${line} (${nombre}): falta la categoría (columna "categoria" o "especie").`);
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

    const active = parseBool(pick(row, ["activo", "active"]), true);
    const featured = parseBool(pick(row, ["destacado", "featured"]), false);
    const cookingMethods = parseCookingMethods(
      pick(row, ["coccion", "cocción", "cooking"])
    );
    const pesoAproxRaw = pick(row, ["peso_aprox_kg", "peso aprox", "peso", "kg aprox"]).replace(
      ",",
      "."
    );
    const approxWeightKg =
      pesoAproxRaw && Number.isFinite(Number(pesoAproxRaw)) && Number(pesoAproxRaw) > 0
        ? Number(pesoAproxRaw)
        : undefined;

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
        cookingMethods,
        approxWeightKg: approxWeightKg ?? existing.approxWeightKg,
      };
      touchedCodes.add(existing.code);
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
        cookingMethods,
        approxWeightKg,
      };
      products.push(newProduct);
      touchedCodes.add(newProduct.code);
      created += 1;
    }
  });

  // "Reemplazar todo": drop every existing product whose code this import
  // didn't touch, so the file becomes the full catalog instead of a patch.
  let finalProducts = products;
  let deleted = 0;
  if (replaceAll) {
    const before = finalProducts.length;
    finalProducts = finalProducts.filter((p) => touchedCodes.has(p.code));
    deleted = before - finalProducts.length;
  }

  await Promise.all([
    saveProducts(finalProducts),
    categoriesChanged ? saveCategories(categories) : Promise.resolve(),
  ]);

  revalidatePath("/admin/productos");
  revalidatePath("/admin/categorias");
  revalidatePath("/");
  revalidatePath("/tienda");

  return { created, updated, deleted, errors };
}
