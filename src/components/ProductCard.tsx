"use client";

import Image from "next/image";
import { useState } from "react";
import type { ProductWithVariants } from "@/lib/variants";
import { formatPrice } from "@/lib/whatsapp";
import AddToCartForm from "./AddToCartForm";
import ProductModal from "./ProductModal";

export default function ProductCard({ product }: { product: ProductWithVariants }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="group flex flex-col overflow-hidden rounded-xl border border-line bg-white shadow-sm transition-shadow hover:shadow-md">
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="relative aspect-[4/3] w-full overflow-hidden bg-paper-alt text-left"
      >
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
      </button>

      <div className="flex flex-1 flex-col p-4">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="text-left font-display text-xl tracking-wide text-ink hover:text-accent"
        >
          {product.name}
        </button>
        {product.description && (
          <p className="mt-1 line-clamp-2 text-sm text-ink/60">
            {product.description}
          </p>
        )}

        {product.cookingMethods.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {product.cookingMethods.map((method) => (
              <span
                key={method}
                className="rounded-full bg-paper-alt px-2 py-0.5 text-xs text-ink/60"
              >
                {method}
              </span>
            ))}
          </div>
        )}

        {product.unit === "kg" && (product.pieceFormats?.length ?? 0) > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {product.offerLoose === false ? (
              <span className="rounded-full bg-accent/10 px-2 py-0.5 text-xs font-medium text-accent">
                Se vende en {product.pieceFormats![0].label.toLowerCase()}
              </span>
            ) : (
              product.pieceFormats!.map((f) => (
                <span
                  key={f.id}
                  className="rounded-full bg-accent/10 px-2 py-0.5 text-xs font-medium text-accent"
                >
                  También en {f.label.toLowerCase()}
                </span>
              ))
            )}
          </div>
        )}

        <div className="mt-2 flex items-baseline gap-1">
          <span className="text-lg font-bold text-accent">
            {formatPrice(product.price)}
          </span>
          <span className="text-sm text-ink/50">/ {product.unit}</span>
          {product.unit === "unidad" && product.approxWeightKg && (
            <span className="text-sm text-ink/40">
              (≈{product.approxWeightKg}kg)
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={() => setOpen(true)}
          className="mt-1 self-start text-xs font-medium text-ink/50 underline decoration-line underline-offset-2 hover:text-accent"
        >
          Ver detalles
        </button>

        <div className="mt-3">
          <AddToCartForm product={product} compact />
        </div>
      </div>

      {open && <ProductModal product={product} onClose={() => setOpen(false)} />}
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
