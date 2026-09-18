"use client";

import { useEffect } from "react";
import Image from "next/image";
import { createPortal } from "react-dom";
import type { ProductWithVariants } from "@/lib/variants";
import { formatPrice } from "@/lib/whatsapp";
import AddToCartForm from "./AddToCartForm";

export default function ProductModal({
  product,
  onClose,
}: {
  product: ProductWithVariants;
  onClose: () => void;
}) {
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 p-4"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="grid gap-0 sm:grid-cols-2">
          <div className="relative aspect-[4/3] w-full bg-paper-alt sm:aspect-auto sm:h-full">
            {product.imageUrl ? (
              <Image
                src={product.imageUrl}
                alt={product.name}
                fill
                sizes="(min-width: 640px) 50vw, 100vw"
                className="object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-ink/20">
                <svg width="72" height="72" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M12 2c-4 0-7 3-7 7 0 3 2 5 3 7l-2 4a1 1 0 0 0 1.3 1.3L11 19h2l3.7 2.3A1 1 0 0 0 18 20l-2-4c1-2 3-4 3-7 0-4-3-7-7-7z" />
                </svg>
              </div>
            )}
            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar"
              className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-ink shadow hover:bg-white"
            >
              ✕
            </button>
          </div>

          <div className="p-6 sm:p-8">
            <h2 className="font-display text-3xl tracking-wide text-ink">
              {product.name}
            </h2>
            {product.description && (
              <p className="mt-2 text-sm text-ink/60">{product.description}</p>
            )}

            {product.cookingMethods.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {product.cookingMethods.map((method) => (
                  <span
                    key={method}
                    className="rounded-full bg-paper-alt px-2.5 py-1 text-xs text-ink/60"
                  >
                    {method}
                  </span>
                ))}
              </div>
            )}

            {product.unit === "kg" && product.offerLoose !== false && (product.pieceFormats?.length ?? 0) > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {product.pieceFormats!.map((f) => (
                  <span
                    key={f.id}
                    className="rounded-full bg-accent/10 px-2.5 py-1 text-xs font-medium text-accent"
                  >
                    También en {f.label.toLowerCase()}
                  </span>
                ))}
              </div>
            )}

            <div className="mt-4 flex items-baseline gap-1">
              <span className="text-2xl font-bold text-accent">
                {formatPrice(product.price)}
              </span>
              <span className="text-sm text-ink/50">/ {product.unit}</span>
              {product.unit === "unidad" && product.approxWeightKg && (
                <span className="text-sm text-ink/40">
                  ({product.approxWeightKg}kg aprox)
                </span>
              )}
            </div>

            <div className="mt-6">
              <AddToCartForm product={product} />
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
