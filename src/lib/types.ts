export type Unit = "kg" | "unidad";

export const COOKING_METHODS = [
  "Parrilla",
  "Horno",
  "Plancha",
  "Cacerola",
  "Milanesa",
] as const;
export type CookingMethod = (typeof COOKING_METHODS)[number];

export type Category = {
  id: string;
  slug: string;
  name: string;
  order: number;
};

export type Product = {
  id: string;
  slug: string;
  code: string;
  name: string;
  categoryId: string;
  unit: Unit;
  price: number;
  description: string;
  imageUrl: string;
  active: boolean;
  featured: boolean;
  order: number;
  cookingMethods: CookingMethod[];
  // Presentation variants (corte de picado, grosor de bifes, marcado,
  // etc.). Most products have none; some need more than one independent
  // dimension at once (e.g. "Bifes de 4cm" AND "2 marcas" together), so
  // this is a list of slots rather than a single selection. Each slot
  // picks a variant group and which of ITS options apply to this product
  // (not every option in a group necessarily applies to every product),
  // with an optional note per option (e.g. approx. kg per tira, which
  // depends on the product).
  variantSelections?: ProductVariantSelection[];
  // Fixed-weight ways to buy a kg-priced product other than loose by kg
  // (e.g. "Pieza entera" ~5kg, "Bolsa de 1kg", "Trozo de 1kg", "Churrasco"
  // ~1kg). Each format's total is calculated as price (per kg) * approxKg
  // * quantity. Only meaningful when unit === "kg"; irrelevant otherwise.
  pieceFormats?: PieceFormat[];
  // Whether buying loose "por kg" is offered at all. Defaults to true when
  // unset. Set to false (with at least one pieceFormat) for cuts that are
  // only ever sold in fixed portions, e.g. osobuco en bolsas de 1kg.
  offerLoose?: boolean;
  // Approximate weight of "one" of this product, in kg. Only meaningful
  // when unit === "unidad" (e.g. combos, pollo entero por unidad): purely
  // informational, shown as "~X kg" next to the price, since the unit
  // already has its own flat price.
  approxWeightKg?: number;
};

export type PieceFormat = {
  id: string;
  label: string;
  approxKg: number;
};

export type ProductVariantSelection = {
  groupId: string;
  optionKeys: string[];
  optionNotes?: Record<string, string>;
};

export type VariantOption = {
  key: string;
  label: string;
};

export type VariantGroup = {
  id: string;
  name: string;
  options: VariantOption[];
  order: number;
};

export type Banner = {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  linkUrl: string;
  active: boolean;
  order: number;
};

export type Settings = {
  storeName: string;
  tagline: string;
  logoUrl: string;
  whatsappMinorista: string;
  whatsappMayorista: string;
  mayoristaIntro: string;
  mayoristaBullets: string[];
  address: string;
  hours: string;
  instagram: string;
  email: string;
  minOrderNote: string;
};
