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
