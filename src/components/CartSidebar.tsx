"use client";

import { useState } from "react";
import { useCart } from "@/lib/cart-context";
import { formatPrice, waLink } from "@/lib/whatsapp";

export default function CartSidebar({
  whatsapp,
  minOrderNote,
}: {
  whatsapp: string;
  minOrderNote?: string;
}) {
  const { items, updateQty, removeItem, clear, totalPrice } = useCart();
  const [name, setName] = useState("");
  const [notes, setNotes] = useState("");

  function buildMessage() {
    const lines = [
      "Hola Baires Beef! Quiero hacer el siguiente pedido:",
      "",
      ...items.map((i) => {
        const variant = i.variantLabel ? ` (${i.variantLabel})` : "";
        const qtyLabel = i.formatLabel
          ? `${i.qty} ${i.formatLabel}${i.formatApproxKg ? ` (${i.formatApproxKg}kg aprox c/u)` : ""}`
          : `${i.qty} ${i.unit === "kg" ? "kg" : "u."}`;
        return `• ${i.name}${variant} — ${qtyLabel} (${formatPrice(i.price * i.qty)})`;
      }),
      "",
      `Total estimado: ${formatPrice(totalPrice)}`,
    ];
    if (name.trim()) lines.push("", `Nombre: ${name.trim()}`);
    if (notes.trim()) lines.push(`Notas: ${notes.trim()}`);
    return lines.join("\n");
  }

  const href = items.length > 0 ? waLink(whatsapp, buildMessage()) : "#";

  return (
    <div
      id="carrito"
      className="scroll-mt-24 rounded-2xl border border-line bg-white p-5"
    >
      <h2 className="font-display text-xl tracking-wide text-ink">Tu pedido</h2>

      {items.length === 0 ? (
        <p className="mt-3 text-sm text-ink/60">
          Todavía no agregaste cortes. Elegí tus productos y sumalos al
          pedido.
        </p>
      ) : (
        <>
          <ul className="mt-3 max-h-[45vh] divide-y divide-line overflow-y-auto">
            {items.map((item) => (
              <li key={item.lineId} className="py-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium text-ink">{item.name}</p>
                    {item.variantLabel && (
                      <p className="text-xs text-ink/50">{item.variantLabel}</p>
                    )}
                    <p className="text-xs text-ink/40">
                      {item.formatLabel
                        ? `${formatPrice(item.price)} / ${item.formatLabel.toLowerCase()}${
                            item.formatApproxKg ? ` (${item.formatApproxKg}kg aprox)` : ""
                          }`
                        : `${formatPrice(item.price)} / ${item.unit}`}
                    </p>
                  </div>
                  <button
                    type="button"
                    aria-label={`Quitar ${item.name}`}
                    onClick={() => removeItem(item.lineId)}
                    className="text-ink/40 hover:text-accent"
                  >
                    ✕
                  </button>
                </div>
                <div className="mt-2 flex items-center justify-between gap-2">
                  <input
                    type="number"
                    min={item.formatLabel ? 1 : item.unit === "kg" ? 0.5 : 1}
                    step={item.formatLabel ? 1 : item.unit === "kg" ? 0.5 : 1}
                    value={item.qty}
                    onChange={(e) => updateQty(item.lineId, Number(e.target.value))}
                    className="w-16 rounded-lg border border-line px-2 py-1 text-sm"
                  />
                  <span className="text-sm font-semibold">
                    {formatPrice(item.price * item.qty)}
                  </span>
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-3 space-y-2 border-t border-line pt-3">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Tu nombre (opcional)"
              className="w-full rounded-lg border border-line px-3 py-2 text-sm"
            />
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Notas (opcional)"
              className="w-full rounded-lg border border-line px-3 py-2 text-sm"
            />
          </div>

          <div className="mt-4 border-t border-line pt-4">
            <div className="flex items-baseline justify-between">
              <span className="text-sm text-ink/60">Total estimado</span>
              <span className="text-xl font-bold text-accent">
                {formatPrice(totalPrice)}
              </span>
            </div>
            {minOrderNote && (
              <p className="mt-1 text-xs text-ink/50">{minOrderNote}</p>
            )}

            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={clear}
                className="rounded-lg border border-line px-3 py-2.5 text-sm font-medium text-ink/70 hover:border-ink/40"
              >
                Vaciar
              </button>
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-[#25D366] px-3 py-2.5 text-sm font-semibold text-white transition-transform hover:scale-[1.02]"
              >
                Finalizar por WhatsApp
              </a>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
