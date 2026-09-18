import Papa from "papaparse";
import { slugify } from "./data";
import { MAX_PIECE_FORMATS } from "./product-helpers";
import { COOKING_METHODS, type Category, type CookingMethod, type PieceFormat, type Product } from "./types";

const FORMAT_HEADERS = Array.from({ length: MAX_PIECE_FORMATS }, (_, i) => [
  `formato${i + 1}`,
  `formato${i + 1}_kg`,
]).flat();

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
  "vender_suelto",
  ...FORMAT_HEADERS,
] as const;

export function productsToCsv(products: Product[], categories: Category[]): string {
  const categoryName = (id: string) => categories.find((c) => c.id === id)?.name ?? "";
  const rows = products.map((p) => {
    const formatColumns: Record<string, string | number> = {};
    for (let i = 0; i < MAX_PIECE_FORMATS; i++) {
      const format = p.pieceFormats?.[i];
      formatColumns[`formato${i + 1}`] = format?.label ?? "";
      formatColumns[`formato${i + 1}_kg`] = format?.approxKg ?? "";
    }
    return {
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
      vender_suelto: p.offerLoose === false ? "no" : "si",
      ...formatColumns,
    };
  });
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

export function parseBool(value: string, fallback: boolean): boolean {
  const v = value.trim().toLowerCase();
  if (!v) return fallback;
  return ["si", "sí", "true", "1", "yes"].includes(v);
}

export type ParsedPieceFormats = {
  // true when at least one formatoN/formatoN_kg cell had something in it —
  // the caller should only replace the product's saved formats when this
  // is true AND pieceFormats ends up non-empty; if every entry failed
  // validation (see errors), pieceFormats is empty but nothing should be
  // wiped, since that's almost certainly a typo rather than "clear these".
  formatEntriesTouched: boolean;
  pieceFormats: PieceFormat[];
  // Raw "vender_suelto" cell, "" if blank/absent — parse with parseBool
  // yourself, since whether it should apply at all depends on whether the
  // format columns were touched too (the caller has that context).
  venderSueltoRaw: string;
  errors: string[];
};

/**
 * Reads up to MAX_PIECE_FORMATS "formatoN" / "formatoN_kg" column pairs
 * (pieza entera, bolsa de 1kg, trozo, etc.) from a row. A pair only counts
 * once both its name and its weight are filled — an incomplete pair, or a
 * weight that isn't a valid number > 0, is reported as an error and
 * skipped rather than silently dropped.
 */
export function parsePieceFormatsFromRow(row: Record<string, string>): ParsedPieceFormats {
  const errors: string[] = [];
  const entries: { label: string; kgRaw: string }[] = [];
  for (let i = 1; i <= MAX_PIECE_FORMATS; i++) {
    const label = pick(row, [`formato${i}`, `formato_${i}`]);
    const kgRaw = pick(row, [`formato${i}_kg`, `formato${i}_peso`, `formato_${i}_kg`]).replace(
      ",",
      "."
    );
    if (label || kgRaw) entries.push({ label, kgRaw });
  }

  const pieceFormats: PieceFormat[] = [];
  for (const { label, kgRaw } of entries) {
    if (!label || !kgRaw) {
      errors.push(
        `el formato "${label || kgRaw}" está incompleto (falta el nombre o el peso).`
      );
      continue;
    }
    const approxKg = Number(kgRaw);
    if (!Number.isFinite(approxKg) || approxKg <= 0) {
      errors.push(`el formato "${label}" tiene un peso inválido ("${kgRaw}").`);
      continue;
    }
    pieceFormats.push({ id: `pf-${pieceFormats.length}-${slugify(label)}`, label, approxKg });
  }

  return {
    formatEntriesTouched: entries.length > 0,
    pieceFormats,
    venderSueltoRaw: pick(row, ["vender_suelto", "suelto"]),
    errors,
  };
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
