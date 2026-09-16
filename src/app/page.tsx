import Link from "next/link";
import Image from "next/image";
import { getActiveProducts, getCategories, getSettings, getVariantGroups } from "@/lib/data";
import { withResolvedVariants } from "@/lib/variants";
import ProductCard from "@/components/ProductCard";

export default async function Home() {
  const [products, categories, settings, groups] = await Promise.all([
    getActiveProducts(),
    getCategories(),
    getSettings(),
    getVariantGroups(),
  ]);

  const featured = withResolvedVariants(products, groups)
    .filter((p) => p.featured)
    .slice(0, 8);

  return (
    <div>
      <Hero storeName={settings.storeName} logoUrl={settings.logoUrl} />

      <section className="container-page py-14">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-display text-lg tracking-widest text-accent">
              DESTACADOS
            </p>
            <h2 className="font-display text-3xl tracking-wide text-ink sm:text-4xl">
              Lo más pedido de la semana
            </h2>
          </div>
          <Link
            href="/tienda"
            className="text-sm font-semibold text-ink underline decoration-accent decoration-2 underline-offset-4"
          >
            Ver todo el catálogo →
          </Link>
        </div>

        {featured.length > 0 ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <p className="text-ink/60">Muy pronto vas a ver acá nuestros cortes destacados.</p>
        )}
      </section>

      <CategoryStrip categories={categories} />

      <MinoristaMayoristaSection />

      <TrustStrip />
    </div>
  );
}

function Hero({ storeName, logoUrl }: { storeName: string; logoUrl: string }) {
  return (
    <section className="relative overflow-hidden bg-ink text-paper">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(45deg, #FAF6F0 0, #FAF6F0 1px, transparent 1px, transparent 22px)",
        }}
      />
      <div className="container-page relative flex flex-col items-center gap-8 py-20 text-center sm:py-28">
        <Image
          src={logoUrl || "/logo.svg"}
          alt={storeName}
          width={112}
          height={112}
          className="rounded-2xl shadow-xl"
          priority
        />
        <div>
          <p className="font-display text-lg tracking-[0.3em] text-flag">
            FRIGORÍFICO
          </p>
          <h1 className="font-display text-5xl leading-none tracking-wide sm:text-7xl">
            {storeName}
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-paper/70 sm:text-lg">
            Carne argentina de primera calidad. Cortes seleccionados para tu
            parrilla y precios especiales para tu negocio.
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/tienda"
            className="rounded-lg bg-accent px-7 py-3.5 text-sm font-bold uppercase tracking-wide text-paper transition-colors hover:bg-accent-dark"
          >
            Comprar minorista
          </Link>
          <Link
            href="/mayorista"
            className="rounded-lg border border-paper/30 px-7 py-3.5 text-sm font-bold uppercase tracking-wide text-paper transition-colors hover:border-paper"
          >
            Soy mayorista
          </Link>
        </div>
      </div>
    </section>
  );
}

function CategoryStrip({
  categories,
}: {
  categories: { id: string; slug: string; name: string }[];
}) {
  return (
    <section className="border-y border-line bg-paper-alt py-12">
      <div className="container-page">
        <h2 className="mb-6 font-display text-2xl tracking-wide text-ink">
          Categorías
        </h2>
        <div className="flex flex-wrap gap-3">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/tienda?categoria=${cat.slug}`}
              className="rounded-full border border-line bg-white px-5 py-2 text-sm font-medium text-ink/80 transition-colors hover:border-accent hover:text-accent"
            >
              {cat.name}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function MinoristaMayoristaSection() {
  return (
    <section className="container-page py-16">
      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-line bg-white p-8">
          <p className="font-display text-lg tracking-widest text-accent">
            MINORISTA
          </p>
          <h3 className="mt-1 font-display text-3xl tracking-wide text-ink">
            Para tu casa
          </h3>
          <p className="mt-3 text-ink/60">
            Elegí tus cortes en la tienda online, armá tu pedido y coordinalo
            por WhatsApp. Sin vueltas.
          </p>
          <Link
            href="/tienda"
            className="mt-6 inline-block rounded-lg bg-ink px-6 py-3 text-sm font-bold uppercase tracking-wide text-paper hover:bg-accent"
          >
            Ir a la tienda
          </Link>
        </div>

        <div className="rounded-2xl border border-flag/30 bg-ink p-8 text-paper">
          <p className="font-display text-lg tracking-widest text-flag">
            MAYORISTA
          </p>
          <h3 className="mt-1 font-display text-3xl tracking-wide">
            Para tu negocio
          </h3>
          <p className="mt-3 text-paper/70">
            Parrillas, restaurantes y carnicerías: consultanos por precios por
            volumen y cortes a medida.
          </p>
          <Link
            href="/mayorista"
            className="mt-6 inline-block rounded-lg bg-flag px-6 py-3 text-sm font-bold uppercase tracking-wide text-ink hover:bg-flag-dark hover:text-paper"
          >
            Quiero ser mayorista
          </Link>
        </div>
      </div>
    </section>
  );
}

function TrustStrip() {
  const items = [
    { title: "Calidad garantizada", text: "Cortes seleccionados y frescura de primera." },
    { title: "Pedido simple", text: "Elegís, confirmás por WhatsApp y listo." },
    { title: "Precios claros", text: "Vas viendo el precio actualizado en cada corte." },
  ];
  return (
    <section className="bg-paper-alt py-14">
      <div className="container-page grid gap-8 sm:grid-cols-3">
        {items.map((item) => (
          <div key={item.title}>
            <h3 className="font-display text-xl tracking-wide text-ink">
              {item.title}
            </h3>
            <p className="mt-1 text-sm text-ink/60">{item.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
