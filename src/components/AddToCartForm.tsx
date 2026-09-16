"use client";

import { useState } from "react";
import { useCart } from "@/lib/cart-context";
import type { ProductWithVariants } from "@/lib/variants";
import type { Unit } from "@/lib/types";

const STEP: Record<Unit, number> = { kg: 0.5, unidad: 1 };
const MIN: Record<Unit, number> = { kg: 0.5, unidad: 1 };

export default function AddToCartForm({
  product,
  compact = false,
}: {
  product: ProductWithVariants;
  compact?: boolean;
}) {
  const { addItem } = useCart();
  const [variantKey, setVariantKey] = useState(product.variantOptions[0]?.key ?? "");
  const [qty, setQty] = useState(MIN[product.unit]);
  const [added, setAdded] = useState(false);

  const step = STEP[product.unit];
  const min = MIN[product.unit];
  const selectedOption = product.variantOptions.find((o) => o.key === variantKey);

  function handleAdd() {
    addItem(
      {
        productId: product.id,
        slug: product.slug,
        name: product.name,
        unit: product.unit,
        price: product.price,
        variantKey: selectedOption?.key,
        variantLabel: selectedOption?.label,
      },
      qty
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  return (
    <div className={compact ? "space-y-2" : "space-y-3"}>
      {product.variantOptions.length > 0 && (
        <div>
          <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-ink/50">
            Presentación
          </label>
          <select
            value={variantKey}
            onChange={(e) => setVariantKey(e.target.value)}
            className="w-full rounded-lg border border-line bg-white px-3 py-2 text-sm"
          >
            {product.variantOptions.map((opt) => (
              <option key={opt.key} value={opt.key}>
                {opt.label}
                {opt.note ? ` — ${opt.note}` : ""}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="flex items-center gap-2">
        <div className="flex items-center rounded-lg border border-line">
          <button
            type="button"
            aria-label="Restar"
            className="px-2.5 py-1.5 text-ink/70 hover:text-ink"
            onClick={() => setQty((q) => Math.max(min, Number((q - step).toFixed(2))))}
          >
            −
          </button>
          <span className="min-w-[3rem] text-center text-sm font-medium">
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
  );
}
