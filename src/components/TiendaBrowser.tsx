"use client";

import { useMemo, useState } from "react";
import type { Category, Product } from "@/lib/types";
import ProductCard from "./ProductCard";

export default function TiendaBrowser({
  categories,
  products,
  initialCategorySlug,
}: {
  categories: Category[];
  products: Product[];
  initialCategorySlug?: string;
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

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          <FilterChip
            active={categoryId === "all"}
            label="Todos"
            onClick={() => setCategoryId("all")}
          />
          {categories.map((cat) => (
            <FilterChip
              key={cat.id}
              active={categoryId === cat.id}
              label={cat.name}
              onClick={() => setCategoryId(cat.id)}
            />
          ))}
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
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}

function FilterChip({
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
      className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
        active
          ? "border-ink bg-ink text-paper"
          : "border-line bg-white text-ink/70 hover:border-ink/40"
      }`}
    >
      {label}
    </button>
  );
}
