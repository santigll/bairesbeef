"use client";

import { useState } from "react";
import { useCart } from "@/lib/cart-context";
import { formatPrice, waLink } from "@/lib/whatsapp";

export default function CartSummary({
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
      ...items.map(
        (i) =>
          `• ${i.name} — ${i.qty} ${i.unit === "kg" ? "kg" : "u."} (${formatPrice(
            i.price * i.qty
          )})`
      ),
      "",
      `Total estimado: ${formatPrice(totalPrice)}`,
    ];
    if (name.trim()) lines.push("", `Nombre: ${name.trim()}`);
    if (notes.trim()) lines.push(`Notas: ${notes.trim()}`);
    return lines.join("\n");
  }

  const href = items.length > 0 ? waLink(whatsapp, buildMessage()) : "#";

  return (
    <section
      id="carrito"
      className="mt-14 scroll-mt-24 rounded-2xl border border-line bg-white p-5 sm:p-6"
    >
      <h2 className="font-display text-2xl tracking-wide text-ink">
        Tu pedido
      </h2>

      {items.length === 0 ? (
        <p className="mt-3 text-sm text-ink/60">
          Todavía no agregaste cortes. Elegí tus productos arriba y sumalos al
          pedido.
        </p>
      ) : (
        <>
          <ul className="mt-4 divide-y divide-line">
            {items.map((item) => (
              <li
                key={item.productId}
                className="flex flex-wrap items-center justify-between gap-3 py-3"
              >
                <div>
                  <p className="font-medium text-ink">{item.name}</p>
                  <p className="text-xs text-ink/50">
                    {formatPrice(item.price)} / {item.unit}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min={item.unit === "kg" ? 0.5 : 1}
                    step={item.unit === "kg" ? 0.5 : 1}
                    value={item.qty}
                    onChange={(e) =>
                      updateQty(item.productId, Number(e.target.value))
                    }
                    className="w-20 rounded-lg border border-line px-2 py-1 text-sm"
                  />
                  <span className="w-24 text-right text-sm font-semibold">
                    {formatPrice(item.price * item.qty)}
                  </span>
                  <button
                    type="button"
                    aria-label={`Quitar ${item.name}`}
                    onClick={() => removeItem(item.productId)}
                    className="text-ink/40 hover:text-accent"
                  >
                    ✕
                  </button>
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Tu nombre (opcional)"
              className="rounded-lg border border-line px-3 py-2 text-sm"
            />
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Notas para el pedido (opcional)"
              className="rounded-lg border border-line px-3 py-2 text-sm"
            />
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-4">
            <div>
              <p className="text-sm text-ink/60">Total estimado</p>
              <p className="text-2xl font-bold text-accent">
                {formatPrice(totalPrice)}
              </p>
              {minOrderNote && (
                <p className="mt-1 text-xs text-ink/50">{minOrderNote}</p>
              )}
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={clear}
                className="rounded-lg border border-line px-4 py-2.5 text-sm font-medium text-ink/70 hover:border-ink/40"
              >
                Vaciar
              </button>
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-lg bg-[#25D366] px-5 py-2.5 text-sm font-semibold text-white transition-transform hover:scale-[1.02]"
              >
                Finalizar por WhatsApp
              </a>
            </div>
          </div>
        </>
      )}
    </section>
  );
}
