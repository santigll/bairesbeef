import Papa from "papaparse";
import { COOKING_METHODS, type Category, type CookingMethod, type Product } from "./types";

export const PRODUCT_CSV_HEADERS = [
  "codigo",
  "nombre",
  "categoria",
  "precio",
  "unidad",
  "descripcion",
  "activo",
  "destacado",
  "coccion",
  "peso_aprox_kg",
] as const;

export function productsToCsv(products: Product[], categories: Category[]): string {
  const categoryName = (id: string) => categories.find((c) => c.id === id)?.name ?? "";
  const rows = products.map((p) => ({
    codigo: p.code,
    nombre: p.name,
    categoria: categoryName(p.categoryId),
    precio: p.price,
    unidad: p.unit,
    descripcion: p.description,
    activo: p.active ? "si" : "no",
    destacado: p.featured ? "si" : "no",
    coccion: p.cookingMethods.join(", "),
    peso_aprox_kg: p.approxWeightKg ?? "",
  }));
  return Papa.unparse({ fields: [...PRODUCT_CSV_HEADERS], data: rows });
}

/**
 * Reads a value from a parsed row trying several possible header spellings,
 * so a spreadsheet using different-but-equivalent column names (e.g. a
 * Spanish "Especie"/"Corte"/"Código" layout instead of our own
 * "categoria"/"nombre"/"codigo" export headers) still imports without
 * having to be reshaped first. Headers arrive lowercased and trimmed
 * (see parseCsvRows), so candidates should be given the same way.
 */
export function pick(row: Record<string, string>, candidates: string[]): string {
  for (const key of candidates) {
    const value = row[key];
    if (value != null && String(value).trim() !== "") return String(value).trim();
  }
  return "";
}

/**
 * Splits a free-form "coccion" cell ("Parrilla, Horno" / "parrilla;horno")
 * into our fixed set of cooking methods, matching case-insensitively and
 * silently dropping anything that isn't one of the known values.
 */
export function parseCookingMethods(value: string): CookingMethod[] {
  const found = new Set<CookingMethod>();
  for (const part of value.split(/[,;/]/)) {
    const normalized = part.trim().toLowerCase();
    const match = COOKING_METHODS.find((m) => m.toLowerCase() === normalized);
    if (match) found.add(match);
  }
  return [...found];
}

export function parseCsvRows(text: string): Record<string, string>[] {
  // Normalize line endings first: Papa Parse locks onto whichever newline
  // style it detects first in the file and won't split rows on a different
  // one, so a file with mixed \r\n/\n (common after hand-editing, or rows
  // pasted in from another source) would otherwise merge rows together.
  const normalized = text.replace(/\r\n|\r/g, "\n");
  const result = Papa.parse<Record<string, string>>(normalized, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim().toLowerCase(),
  });
  return result.data;
}
