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

  return (
    <div>
      <PromoBanner banners={banners} />

      <div className="container-wide py-10">
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
