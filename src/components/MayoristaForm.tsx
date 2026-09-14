"use client";

import { useState } from "react";
import { waLink } from "@/lib/whatsapp";

const RUBROS = [
  "Restaurante",
  "Parrilla",
  "Carnicería",
  "Rotisería",
  "Catering / Eventos",
  "Otro",
];

export default function MayoristaForm({ phone }: { phone: string }) {
  const [business, setBusiness] = useState("");
  const [rubro, setRubro] = useState(RUBROS[0]);
  const [message, setMessage] = useState("");

  function buildMessage() {
    const lines = [
      "Hola Baires Beef! Quiero hacer una consulta mayorista.",
      "",
      business.trim() && `Negocio: ${business.trim()}`,
      `Rubro: ${rubro}`,
      message.trim() && `Detalle: ${message.trim()}`,
    ].filter(Boolean);
    return lines.join("\n");
  }

  return (
    <form
      className="rounded-2xl border border-line bg-white p-6 sm:p-8"
      onSubmit={(e) => {
        e.preventDefault();
        window.open(waLink(phone, buildMessage()), "_blank", "noopener,noreferrer");
      }}
    >
      <h3 className="font-display text-2xl tracking-wide text-ink">
        Contanos sobre tu negocio
      </h3>
      <p className="mt-1 text-sm text-ink/60">
        Completá estos datos y te vamos a llevar directo a WhatsApp para
        cerrar los detalles con nosotros.
      </p>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-1">
          <label className="mb-1 block text-sm font-medium text-ink/70">
            Nombre del negocio
          </label>
          <input
            type="text"
            value={business}
            onChange={(e) => setBusiness(e.target.value)}
            placeholder="Ej: Parrilla El Fogón"
            className="w-full rounded-lg border border-line px-3 py-2 text-sm"
          />
        </div>
        <div className="sm:col-span-1">
          <label className="mb-1 block text-sm font-medium text-ink/70">
            Rubro
          </label>
          <select
            value={rubro}
            onChange={(e) => setRubro(e.target.value)}
            className="w-full rounded-lg border border-line px-3 py-2 text-sm"
          >
            {RUBROS.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>
        <div className="sm:col-span-2">
          <label className="mb-1 block text-sm font-medium text-ink/70">
            ¿Qué necesitás?
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={3}
            placeholder="Ej: cortes, volumen estimado por semana, zona de entrega..."
            className="w-full rounded-lg border border-line px-3 py-2 text-sm"
          />
        </div>
      </div>

      <button
        type="submit"
        className="mt-5 flex items-center gap-2 rounded-lg bg-[#25D366] px-6 py-3 text-sm font-semibold text-white transition-transform hover:scale-[1.02]"
      >
        Enviar consulta por WhatsApp
      </button>
    </form>
  );
}
