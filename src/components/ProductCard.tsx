"use client";

import Image from "next/image";
import { useState } from "react";
import type { Product } from "@/lib/types";
import { formatPrice } from "@/lib/whatsapp";
import { useCart } from "@/lib/cart-context";

const STEP: Record<Product["unit"], number> = { kg: 0.5, unidad: 1 };
const MIN: Record<Product["unit"], number> = { kg: 0.5, unidad: 1 };

export default function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();
  const [qty, setQty] = useState(MIN[product.unit]);
  const [added, setAdded] = useState(false);

  const step = STEP[product.unit];
  const min = MIN[product.unit];

  function handleAdd() {
    addItem(
      {
        productId: product.id,
        slug: product.slug,
        name: product.name,
        unit: product.unit,
        price: product.price,
      },
      qty
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  return (
    <div className="group flex flex-col overflow-hidden rounded-xl border border-line bg-white shadow-sm transition-shadow hover:shadow-md">
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-paper-alt">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <PlaceholderArt />
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-display text-xl tracking-wide text-ink">
          {product.name}
        </h3>
        {product.description && (
          <p className="mt-1 line-clamp-2 text-sm text-ink/60">
            {product.description}
          </p>
        )}

        <div className="mt-3 flex items-baseline gap-1">
          <span className="text-lg font-bold text-accent">
            {formatPrice(product.price)}
          </span>
          <span className="text-sm text-ink/50">/ {product.unit}</span>
        </div>

        <div className="mt-4 flex items-center gap-2">
          <div className="flex items-center rounded-lg border border-line">
            <button
              type="button"
              aria-label="Restar"
              className="px-2.5 py-1.5 text-ink/70 hover:text-ink"
              onClick={() => setQty((q) => Math.max(min, Number((q - step).toFixed(2))))}
            >
              −
            </button>
            <span className="min-w-[2.5rem] text-center text-sm font-medium">
              {qty} {product.unit === "kg" ? "kg" : "u."}
            </span>
            <button
              type="button"
              aria-label="Sumar"
              className="px-2.5 py-1.5 text-ink/70 hover:text-ink"
              onClick={() => setQty((q) => Number((q + step).toFixed(2)))}
            >
              +
            </button>
          </div>
          <button
            type="button"
            onClick={handleAdd}
            className={`flex-1 rounded-lg px-3 py-2 text-sm font-semibold text-paper transition-colors ${
              added ? "bg-flag-dark" : "bg-ink hover:bg-accent"
            }`}
          >
            {added ? "Agregado ✓" : "Agregar"}
          </button>
        </div>
      </div>
    </div>
  );
}

function PlaceholderArt() {
  return (
    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-paper-alt to-line">
      <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#141311" strokeOpacity="0.25" strokeWidth="1.5">
        <path d="M12 2c-4 0-7 3-7 7 0 3 2 5 3 7l-2 4a1 1 0 0 0 1.3 1.3L11 19h2l3.7 2.3A1 1 0 0 0 18 20l-2-4c1-2 3-4 3-7 0-4-3-7-7-7z" />
        <circle cx="9.5" cy="9" r="1" fill="#141311" fillOpacity="0.25" stroke="none" />
        <circle cx="14.5" cy="9" r="1" fill="#141311" fillOpacity="0.25" stroke="none" />
      </svg>
    </div>
  );
}
