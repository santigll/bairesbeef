import type { Product } from "./types";

export function uniqueSlug(base: string, products: Product[], ignoreId?: string): string {
  const taken = new Set(products.filter((p) => p.id !== ignoreId).map((p) => p.slug));
  let slug = base || "producto";
  let i = 2;
  while (taken.has(slug)) {
    slug = `${base}-${i}`;
    i += 1;
  }
  return slug;
}

export function generateCode(): string {
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `P-${Date.now().toString(36).toUpperCase()}${rand}`;
}

export function uniqueCode(base: string, products: Product[], ignoreId?: string): string {
  const taken = new Set(products.filter((p) => p.id !== ignoreId).map((p) => p.code));
  let code = base || generateCode();
  let i = 2;
  while (taken.has(code)) {
    code = `${base}-${i}`;
    i += 1;
  }
  return code;
}

/**
 * Resolves the code to use for a manual (single-product) save: an explicit
 * code must be unique or we reject it outright (the admin typed it on
 * purpose), while leaving it blank auto-generates a fresh unique one.
 */
export function resolveProductCode(
  codeInput: string,
  products: Product[],
  ignoreId?: string
): string {
  if (!codeInput) return uniqueCode(generateCode(), products, ignoreId);
  const taken = products.some((p) => p.id !== ignoreId && p.code === codeInput);
  if (taken) throw new Error(`El código "${codeInput}" ya está en uso por otro producto.`);
  return codeInput;
}
