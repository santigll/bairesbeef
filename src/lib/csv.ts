import Papa from "papaparse";
import type { Category, Product } from "./types";

export const PRODUCT_CSV_HEADERS = [
  "codigo",
  "nombre",
  "categoria",
  "precio",
  "unidad",
  "descripcion",
  "activo",
  "destacado",
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
  }));
  return Papa.unparse({ fields: [...PRODUCT_CSV_HEADERS], data: rows });
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
