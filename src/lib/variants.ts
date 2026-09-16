import type { Product, VariantGroup } from "./types";

export type ResolvedVariantOption = {
  key: string;
  label: string;
  note?: string;
};

export type ProductWithVariants = Product & {
  variantOptions: ResolvedVariantOption[];
};

export function resolveProductVariantOptions(
  product: Product,
  groups: VariantGroup[]
): ResolvedVariantOption[] {
  if (!product.variantGroupId || !product.variantOptionKeys?.length) return [];
  const group = groups.find((g) => g.id === product.variantGroupId);
  if (!group) return [];

  const enabledSet = new Set(product.variantOptionKeys);
  return group.options
    .filter((o) => enabledSet.has(o.key))
    .map((o) => ({
      key: o.key,
      label: o.label,
      note: product.optionNotes?.[o.key],
    }));
}

export function withResolvedVariants(
  products: Product[],
  groups: VariantGroup[]
): ProductWithVariants[] {
  return products.map((p) => ({
    ...p,
    variantOptions: resolveProductVariantOptions(p, groups),
  }));
}
