"use client";

import { useMemo, useState } from "react";
import type { Category } from "@/lib/types";
import type { ProductWithVariants } from "@/lib/variants";
import ProductCard from "./ProductCard";
import CartSidebar from "./CartSidebar";

export default function TiendaBrowser({
  categories,
  products,
  initialCategorySlug,
  whatsapp,
  minOrderNote,
}: {
  categories: Category[];
  products: ProductWithVariants[];
  initialCategorySlug?: string;
  whatsapp: string;
  minOrderNote?: string;
}) {
  const initialCategory =
    categories.find((c) => c.slug === initialCategorySlug)?.id ?? "all";
  const [categoryId, setCategoryId] = useState<string | "all">(initialCategory);
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchesCategory = categoryId === "all" || p.categoryId === categoryId;
      const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [products, categoryId, search]);

  const activeCategoryName =
    categoryId === "all" ? "Todos" : categories.find((c) => c.id === categoryId)?.name;

  return (
    <div className="grid gap-6 lg:grid-cols-[200px_1fr_320px] lg:items-start">
      <aside className="lg:sticky lg:top-24">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-ink/50">
          Filtros
        </p>
        <nav className="flex gap-2 overflow-x-auto pb-2 lg:flex-col lg:gap-1 lg:overflow-visible lg:pb-0">
          <FilterItem
            active={categoryId === "all"}
            label="Todos"
            onClick={() => setCategoryId("all")}
          />
          {categories.map((cat) => (
            <FilterItem
              key={cat.id}
              active={categoryId === cat.id}
              label={cat.name}
              onClick={() => setCategoryId(cat.id)}
            />
          ))}
        </nav>
      </aside>

      <div>
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-display text-2xl tracking-wide text-ink">
              {activeCategoryName}
            </h2>
            <p className="text-sm text-ink/50">{filtered.length} productos</p>
          </div>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar un corte..."
            className="w-full rounded-lg border border-line bg-white px-4 py-2 text-sm sm:w-64"
          />
        </div>

        {filtered.length === 0 ? (
          <p className="rounded-lg border border-dashed border-line bg-white p-8 text-center text-ink/60">
            No encontramos cortes que coincidan con tu búsqueda.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>

      <aside className="lg:sticky lg:top-24">
        <CartSidebar whatsapp={whatsapp} minOrderNote={minOrderNote} />
      </aside>
    </div>
  );
}

function FilterItem({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-none rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors lg:flex-auto ${
        active
          ? "bg-ink text-paper"
          : "text-ink/70 hover:bg-white hover:text-ink"
      }`}
    >
      {label}
    </button>
  );
}
