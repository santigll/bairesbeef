export type Unit = "kg" | "unidad";

export type Category = {
  id: string;
  slug: string;
  name: string;
  order: number;
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  categoryId: string;
  unit: Unit;
  price: number;
  description: string;
  imageUrl: string;
  active: boolean;
  featured: boolean;
  order: number;
  // Presentation variant (corte de picado, grosor de bifes, marcado, etc.).
  // Optional: most products have none. When set, variantOptionKeys picks
  // which of the group's options apply to THIS product (order preserved
  // from the group), and optionNotes can attach a short note to one of
  // them (e.g. approx. kg per tira, which depends on the product).
  variantGroupId?: string;
  variantOptionKeys?: string[];
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
