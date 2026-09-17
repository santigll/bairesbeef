"use client";

import { useState } from "react";
import { MAX_PIECE_FORMATS } from "@/lib/product-helpers";
import type { PieceFormat } from "@/lib/types";

type FormatState = {
  key: number;
  label: string;
  approxKg: string;
};

let nextKey = 0;

export default function PieceFormatFields({
  initialFormats,
  initialOfferLoose,
}: {
  initialFormats?: PieceFormat[];
  initialOfferLoose?: boolean;
}) {
  const [offerLoose, setOfferLoose] = useState(initialOfferLoose ?? true);
  const [formats, setFormats] = useState<FormatState[]>(() =>
    (initialFormats ?? []).map((f) => ({
      key: nextKey++,
      label: f.label,
      approxKg: String(f.approxKg),
    }))
  );

  function addFormat() {
    setFormats((prev) => [...prev, { key: nextKey++, label: "", approxKg: "" }]);
  }

  function removeFormat(key: number) {
    setFormats((prev) => prev.filter((f) => f.key !== key));
  }

  function updateFormat(key: number, patch: Partial<FormatState>) {
    setFormats((prev) => prev.map((f) => (f.key === key ? { ...f, ...patch } : f)));
  }

  return (
    <div className="space-y-3 rounded-lg border border-line p-4 sm:col-span-2">
      <div>
        <p className="text-sm font-medium text-ink/70">
          Formatos de venta{" "}
          <span className="font-normal text-ink/40">(solo aplica si la unidad es «Por kg»)</span>
        </p>
        <p className="mt-1 text-xs text-ink/50">
          Siempre se cobra por el peso real (con su variación normal de
          ±200/300g) — estos formatos solo cambian cómo se lo llevan
          (pieza entera, bolsa de 1kg, trozo, churrasco, etc.), no cómo se
          calcula el precio: precio/kg × peso aprox. × cantidad. Por
          ejemplo, un corte que se suele comprar entero (como el lomo)
          sigue siendo &quot;por kg&quot; — solo agregale un formato
          &quot;Pieza entera&quot; con su peso aproximado.
        </p>
      </div>

      <label className="flex items-center gap-2 text-sm text-ink/70">
        <input
          type="checkbox"
          name="offerLoose"
          checked={offerLoose}
          onChange={(e) => setOfferLoose(e.target.checked)}
        />
        Vender también suelto por kg
      </label>
      {!offerLoose && (
        <p className="text-xs text-accent">
          Si desmarcás esto, el producto solo se va a poder comprar en los
          formatos fijos de abajo (ej: osobuco que solo sale en bolsas de
          1kg). Cargá al menos uno.
        </p>
      )}

      <div className="space-y-2">
        {formats.map((f, i) => (
          <div key={f.key} className="flex flex-wrap items-center gap-2">
            <input
              type="text"
              name={`pieceFormatLabel_${i}`}
              value={f.label}
              onChange={(e) => updateFormat(f.key, { label: e.target.value })}
              placeholder='Ej: "Pieza entera", "Bolsa de 1kg", "Trozo de 1kg", "Churrasco"'
              className="min-w-[200px] flex-1 rounded-lg border border-line px-3 py-1.5 text-sm"
            />
            <input
              type="number"
              name={`pieceFormatKg_${i}`}
              value={f.approxKg}
              onChange={(e) => updateFormat(f.key, { approxKg: e.target.value })}
              min={0}
              step={0.01}
              placeholder="Peso aprox. (kg)"
              className="w-36 rounded-lg border border-line px-3 py-1.5 text-sm"
            />
            <button
              type="button"
              onClick={() => removeFormat(f.key)}
              aria-label="Quitar formato"
              className="text-ink/40 hover:text-accent"
            >
              ✕
            </button>
          </div>
        ))}
        {formats.length === 0 && (
          <p className="text-xs text-ink/40">Sin formatos fijos cargados.</p>
        )}
      </div>

      {formats.length < MAX_PIECE_FORMATS && (
        <button
          type="button"
          onClick={addFormat}
          className="text-xs font-medium text-accent hover:underline"
        >
          + Agregar formato
        </button>
      )}
    </div>
  );
}
