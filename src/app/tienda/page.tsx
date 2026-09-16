import type { Metadata } from "next";
import {
  getActiveBanners,
  getActiveProducts,
  getCategories,
  getSettings,
  getVariantGroups,
} from "@/lib/data";
import { withResolvedVariants } from "@/lib/variants";
import PromoBanner from "@/components/PromoBanner";
import ProductCard from "@/components/ProductCard";
import TiendaBrowser from "@/components/TiendaBrowser";

export const metadata: Metadata = {
  title: "Productos | Baires Beef",
  description: "Todos nuestros cortes, con precio actualizado y pedido directo por WhatsApp.",
};

export default async function TiendaPage({
  searchParams,
}: {
  searchParams: Promise<{ categoria?: string }>;
}) {
  const [products, categories, settings, groups, banners, params] = await Promise.all([
    getActiveProducts(),
    getCategories(),
    getSettings(),
    getVariantGroups(),
    getActiveBanners(),
    searchParams,
  ]);

  const withVariants = withResolvedVariants(products, groups);
  const featured = withVariants.filter((p) => p.featured).slice(0, 6);

  return (
    <div>
      <PromoBanner banners={banners} />

      <div className="container-page py-10">
        {featured.length > 0 && (
          <section className="mb-12">
            <p className="font-display text-lg tracking-widest text-accent">
              DESTACADOS
            </p>
            <h1 className="font-display text-3xl tracking-wide text-ink sm:text-4xl">
              Lo más pedido de la semana
            </h1>
            <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {featured.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        )}

        <TiendaBrowser
          categories={categories}
          products={withVariants}
          initialCategorySlug={params.categoria}
          whatsapp={settings.whatsappMinorista}
          minOrderNote={undefined}
        />
      </div>
    </div>
  );
}
