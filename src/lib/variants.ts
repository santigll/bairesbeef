import type { Product, VariantGroup } from "./types";

export type ResolvedVariantOption = {
  key: string;
  label: string;
  note?: string;
};

export type ResolvedVariantSlot = {
  groupId: string;
  groupName: string;
  options: ResolvedVariantOption[];
};

export type ProductWithVariants = Product & {
  variantSlots: ResolvedVariantSlot[];
};

export function resolveProductVariantSlots(
  product: Product,
  groups: VariantGroup[]
): ResolvedVariantSlot[] {
  const slots: ResolvedVariantSlot[] = [];

  for (const selection of product.variantSelections ?? []) {
    if (!selection.optionKeys.length) continue;
    const group = groups.find((g) => g.id === selection.groupId);
    if (!group) continue;

    const enabledSet = new Set(selection.optionKeys);
    const options = group.options
      .filter((o) => enabledSet.has(o.key))
      .map((o) => ({
        key: o.key,
        label: o.label,
        note: selection.optionNotes?.[o.key],
      }));
    if (options.length === 0) continue;

    slots.push({ groupId: group.id, groupName: group.name, options });
  }

  return slots;
}

export function withResolvedVariants(
  products: Product[],
  groups: VariantGroup[]
): ProductWithVariants[] {
  return products.map((p) => ({
    ...p,
    variantSlots: resolveProductVariantSlots(p, groups),
  }));
}
