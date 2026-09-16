"use client";

import { useMemo, useState } from "react";
import { COOKING_METHODS, type Category, type CookingMethod } from "@/lib/types";
import type { ProductWithVariants } from "@/lib/variants";
import ProductCard from "./ProductCard";
import CartSidebar from "./CartSidebar";

type FilterId = "destacados" | "all" | string;

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
  const hasFeatured = products.some((p) => p.featured);
  const initialFilter: FilterId = initialCategorySlug
    ? (categories.find((c) => c.slug === initialCategorySlug)?.id ?? "all")
    : hasFeatured
      ? "destacados"
      : "all";
  const [filter, setFilter] = useState<FilterId>(initialFilter);
  const [search, setSearch] = useState("");
  const [cookingFilter, setCookingFilter] = useState<Set<CookingMethod>>(new Set());

  function toggleCookingMethod(method: CookingMethod) {
    setCookingFilter((prev) => {
      const next = new Set(prev);
      if (next.has(method)) next.delete(method);
      else next.add(method);
      return next;
    });
  }

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchesFilter =
        filter === "destacados" ? p.featured : filter === "all" ? true : p.categoryId === filter;
      const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
      const matchesCooking =
        cookingFilter.size === 0 || p.cookingMethods.some((m) => cookingFilter.has(m));
      return matchesFilter && matchesSearch && matchesCooking;
    });
  }, [products, filter, search, cookingFilter]);

  const activeLabel =
    filter === "destacados"
      ? "Destacados de la semana"
      : filter === "all"
        ? "Todos los productos"
        : (categories.find((c) => c.id === filter)?.name ?? "Productos");

  return (
    <div className="grid gap-8 lg:grid-cols-[170px_1fr_300px] lg:items-start">
      <aside className="lg:sticky lg:top-24">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-ink/50">
          Filtros
        </p>
        <nav className="flex gap-2 overflow-x-auto pb-2 lg:flex-col lg:gap-1 lg:overflow-visible lg:pb-0">
          {hasFeatured && (
            <FilterItem
              active={filter === "destacados"}
              label="Destacados"
              onClick={() => setFilter("destacados")}
            />
          )}
          <FilterItem
            active={filter === "all"}
            label="Todos"
            onClick={() => setFilter("all")}
          />
          {categories.map((cat) => (
            <FilterItem
              key={cat.id}
              active={filter === cat.id}
              label={cat.name}
              onClick={() => setFilter(cat.id)}
            />
          ))}
        </nav>

        <p className="mb-3 mt-6 text-xs font-semibold uppercase tracking-wider text-ink/50">
          Cocción
        </p>
        <div className="flex flex-wrap gap-2 lg:flex-col lg:gap-1">
          {COOKING_METHODS.map((method) => (
            <label
              key={method}
              className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm text-ink/70 hover:bg-white"
            >
              <input
                type="checkbox"
                checked={cookingFilter.has(method)}
                onChange={() => toggleCookingMethod(method)}
              />
              {method}
            </label>
          ))}
        </div>
      </aside>

      <div>
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-2xl tracking-wide text-ink sm:text-3xl">
              {activeLabel}
            </h1>
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
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
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
        active ? "bg-ink text-paper" : "text-ink/70 hover:bg-white hover:text-ink"
      }`}
    >
      {label}
    </button>
  );
}
