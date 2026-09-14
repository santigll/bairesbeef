import type { Metadata } from "next";
import { getActiveProducts, getCategories, getSettings } from "@/lib/data";
import TiendaBrowser from "@/components/TiendaBrowser";
import CartSummary from "@/components/CartSummary";

export const metadata: Metadata = {
  title: "Tienda | Baires Beef",
  description: "Todos nuestros cortes, con precio actualizado y pedido directo por WhatsApp.",
};

export default async function TiendaPage({
  searchParams,
}: {
  searchParams: Promise<{ categoria?: string }>;
}) {
  const [products, categories, settings, params] = await Promise.all([
    getActiveProducts(),
    getCategories(),
    getSettings(),
    searchParams,
  ]);

  return (
    <div className="container-page py-10">
      <header className="mb-8">
        <p className="font-display text-lg tracking-widest text-accent">
          MINORISTA
        </p>
        <h1 className="font-display text-4xl tracking-wide text-ink sm:text-5xl">
          Nuestros cortes
        </h1>
        <p className="mt-2 max-w-2xl text-ink/60">
          Elegí tus cortes favoritos, armá tu pedido y coordinalo por
          WhatsApp. Pagás y coordinás la entrega directo con nosotros.
        </p>
      </header>

      <TiendaBrowser
        categories={categories}
        products={products}
        initialCategorySlug={params.categoria}
      />
      <CartSummary whatsapp={settings.whatsappMinorista} />
    </div>
  );
}
