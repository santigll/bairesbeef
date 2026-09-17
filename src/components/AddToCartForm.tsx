"use client";

import { useState } from "react";
import { useCart } from "@/lib/cart-context";
import { formatPrice } from "@/lib/whatsapp";
import type { ProductWithVariants } from "@/lib/variants";
import type { Unit } from "@/lib/types";

const STEP: Record<Unit, number> = { kg: 0.5, unidad: 1 };
const MIN: Record<Unit, number> = { kg: 0.5, unidad: 1 };

type Mode = { id: string; label: string; approxKg?: number };

export default function AddToCartForm({
  product,
  compact = false,
}: {
  product: ProductWithVariants;
  compact?: boolean;
}) {
  const { addItem } = useCart();

  const pieceFormats = product.unit === "kg" ? product.pieceFormats ?? [] : [];
  const showLoose = product.unit === "kg" && (product.offerLoose !== false || pieceFormats.length === 0);
  const modes: Mode[] = [
    ...(showLoose ? [{ id: "loose", label: "Por kg" }] : []),
    ...pieceFormats.map((f) => ({ id: f.id, label: f.label, approxKg: f.approxKg })),
  ];
  const hasModeChoice = modes.length > 1;

  const [modeId, setModeId] = useState(modes[0]?.id ?? "loose");
  const selectedMode = modes.find((m) => m.id === modeId) ?? modes[0];
  const isFixedFormat = !!selectedMode && selectedMode.id !== "loose";

  const [selections, setSelections] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      product.variantSlots
        .filter((slot) => slot.options.length > 0)
        .map((slot) => [slot.groupId, slot.options[0].key])
    )
  );
  const [qty, setQty] = useState(isFixedFormat ? 1 : MIN[product.unit]);
  const [added, setAdded] = useState(false);

  const step = isFixedFormat ? 1 : STEP[product.unit];
  const min = isFixedFormat ? 1 : MIN[product.unit];
  const unitLabel = isFixedFormat ? "u." : product.unit === "kg" ? "kg" : "u.";

  const effectivePrice =
    isFixedFormat && selectedMode?.approxKg
      ? Math.round(product.price * selectedMode.approxKg)
      : product.price;

  function changeMode(next: string) {
    setModeId(next);
    const nextIsFixed = modes.find((m) => m.id === next)?.id !== "loose";
    setQty(nextIsFixed ? 1 : MIN[product.unit]);
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
        formatId: isFixedFormat ? selectedMode!.id : undefined,
        formatLabel: isFixedFormat ? selectedMode!.label : undefined,
        formatApproxKg: isFixedFormat ? selectedMode!.approxKg : undefined,
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

      {hasModeChoice && (
        <div>
          <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-ink/50">
            Cómo lo llevás
          </label>
          <select
            value={modeId}
            onChange={(e) => changeMode(e.target.value)}
            className="w-full rounded-lg border border-line bg-white px-3 py-2 text-sm"
          >
            {modes.map((m) => (
              <option key={m.id} value={m.id}>
                {m.label}
                {m.approxKg ? ` (≈${m.approxKg}kg)` : ""}
              </option>
            ))}
          </select>
        </div>
      )}

      {isFixedFormat && selectedMode?.approxKg && (
        <p className="text-xs text-ink/50">
          {formatPrice(product.price)}/kg × ≈{selectedMode.approxKg}kg ≈{" "}
          {formatPrice(effectivePrice)} por {selectedMode.label.toLowerCase()}
        </p>
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

      {isFixedFormat && (
        <p className="text-right text-sm font-semibold text-ink">
          Total: {formatPrice(effectivePrice * qty)}
        </p>
      )}
    </div>
  );
}
