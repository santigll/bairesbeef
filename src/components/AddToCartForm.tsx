"use client";

import { useState } from "react";
import { useCart } from "@/lib/cart-context";
import { formatPrice } from "@/lib/whatsapp";
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

  const offersWholePiece = product.unit === "kg" && !!product.approxWeightKg;
  const [pieceMode, setPieceMode] = useState(false);
  const [selections, setSelections] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      product.variantSlots
        .filter((slot) => slot.options.length > 0)
        .map((slot) => [slot.groupId, slot.options[0].key])
    )
  );
  const [qty, setQty] = useState(MIN[product.unit]);
  const [added, setAdded] = useState(false);

  const step = pieceMode ? 1 : STEP[product.unit];
  const min = pieceMode ? 1 : MIN[product.unit];
  const unitLabel = pieceMode
    ? qty === 1
      ? "pieza"
      : "piezas"
    : product.unit === "kg"
      ? "kg"
      : "u.";

  const piecePrice =
    offersWholePiece && product.approxWeightKg
      ? Math.round(product.price * product.approxWeightKg)
      : 0;
  const effectivePrice = pieceMode ? piecePrice : product.price;

  function togglePieceMode(next: boolean) {
    setPieceMode(next);
    setQty(next ? 1 : MIN[product.unit]);
  }

  function handleAdd() {
    const variantEntries = product.variantSlots
      .map((slot) => {
        const key = selections[slot.groupId];
        const opt = slot.options.find((o) => o.key === key);
        return opt ? { groupId: slot.groupId, key: opt.key, label: opt.label } : null;
      })
      .filter((v): v is { groupId: string; key: string; label: string } => v !== null);

    const variantKey =
      variantEntries.length > 0
        ? variantEntries.map((v) => `${v.groupId}:${v.key}`).join("|")
        : undefined;
    const variantLabel =
      variantEntries.length > 0
        ? variantEntries.map((v) => v.label).join(", ")
        : undefined;

    addItem(
      {
        productId: product.id,
        slug: product.slug,
        name: product.name,
        unit: product.unit,
        price: effectivePrice,
        variantKey,
        variantLabel,
        pieceMode: pieceMode || undefined,
        pieceApproxKg: pieceMode ? product.approxWeightKg : undefined,
      },
      qty
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  return (
    <div className={compact ? "space-y-2" : "space-y-3"}>
      {product.variantSlots.map((slot) => (
        <div key={slot.groupId}>
          <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-ink/50">
            {slot.groupName}
          </label>
          <select
            value={selections[slot.groupId] ?? ""}
            onChange={(e) =>
              setSelections((prev) => ({ ...prev, [slot.groupId]: e.target.value }))
            }
            className="w-full rounded-lg border border-line bg-white px-3 py-2 text-sm"
          >
            {slot.options.map((opt) => (
              <option key={opt.key} value={opt.key}>
                {opt.label}
                {opt.note ? ` — ${opt.note}` : ""}
              </option>
            ))}
          </select>
        </div>
      ))}

      {offersWholePiece && (
        <div>
          <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-ink/50">
            Cómo lo llevás
          </label>
          <div className="flex rounded-lg border border-line p-0.5">
            <button
              type="button"
              onClick={() => togglePieceMode(false)}
              className={`flex-1 rounded-md px-2 py-1.5 text-xs font-medium transition-colors ${
                !pieceMode ? "bg-ink text-paper" : "text-ink/60 hover:text-ink"
              }`}
            >
              Por kg
            </button>
            <button
              type="button"
              onClick={() => togglePieceMode(true)}
              className={`flex-1 rounded-md px-2 py-1.5 text-xs font-medium transition-colors ${
                pieceMode ? "bg-ink text-paper" : "text-ink/60 hover:text-ink"
              }`}
            >
              Pieza entera (≈{product.approxWeightKg}kg)
            </button>
          </div>
          {pieceMode && (
            <p className="mt-1 text-xs text-ink/50">
              {formatPrice(piecePrice)} aprox. por pieza
            </p>
          )}
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
          <span className="min-w-[3.5rem] text-center text-sm font-medium">
            {qty} {unitLabel}
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
