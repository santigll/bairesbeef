"use client";

import { useState } from "react";
import { MAX_VARIANT_SLOTS } from "@/lib/product-helpers";
import type { ProductVariantSelection, VariantGroup } from "@/lib/types";

type SlotState = {
  key: number;
  groupId: string;
  optionKeys: string[];
  optionNotes: Record<string, string>;
};

let nextKey = 0;

export default function ProductVariantFields({
  groups,
  initialSelections,
}: {
  groups: VariantGroup[];
  initialSelections?: ProductVariantSelection[];
}) {
  const [slots, setSlots] = useState<SlotState[]>(() =>
    (initialSelections ?? []).map((sel) => ({
      key: nextKey++,
      groupId: sel.groupId,
      optionKeys: sel.optionKeys,
      optionNotes: sel.optionNotes ?? {},
    }))
  );

  const usedGroupIds = new Set(slots.map((s) => s.groupId).filter(Boolean));

  function addSlot() {
    setSlots((prev) => [
      ...prev,
      { key: nextKey++, groupId: "", optionKeys: [], optionNotes: {} },
    ]);
  }

  function removeSlot(key: number) {
    setSlots((prev) => prev.filter((s) => s.key !== key));
  }

  function setSlotGroup(key: number, groupId: string) {
    setSlots((prev) =>
      prev.map((s) => (s.key === key ? { ...s, groupId, optionKeys: [], optionNotes: {} } : s))
    );
  }

  return (
    <div className="space-y-3 sm:col-span-2">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-ink/70">
          Variantes de presentación
        </label>
        {slots.length < MAX_VARIANT_SLOTS && (
          <button
            type="button"
            onClick={addSlot}
            className="text-xs font-medium text-accent hover:underline"
          >
            + Agregar otra variante
          </button>
        )}
      </div>
      <p className="text-xs text-ink/50">
        Definís las variantes disponibles (con sus opciones) en la sección{" "}
        <span className="font-medium">Variantes</span> del menú. Un producto
        puede combinar hasta {MAX_VARIANT_SLOTS} variantes distintas a la vez
        (ej: grosor de bife + marcado).
      </p>

      {slots.length === 0 && (
        <p className="text-xs text-ink/40">Sin variantes asignadas.</p>
      )}

      {slots.map((slot, i) => {
        const group = groups.find((g) => g.id === slot.groupId);
        const enabledSet = new Set(slot.optionKeys);
        const availableGroups = groups.filter(
          (g) => g.id === slot.groupId || !usedGroupIds.has(g.id)
        );

        return (
          <div key={slot.key} className="space-y-3 rounded-lg border border-line p-4">
            <div className="flex items-center gap-2">
              <select
                name={`variantGroupId_${i}`}
                value={slot.groupId}
                onChange={(e) => setSlotGroup(slot.key, e.target.value)}
                className="flex-1 rounded-lg border border-line px-3 py-2 text-sm"
              >
                <option value="">Ninguna</option>
                {availableGroups.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => removeSlot(slot.key)}
                aria-label="Quitar variante"
                className="text-ink/40 hover:text-accent"
              >
                ✕
              </button>
            </div>

            {group && (
              <div key={group.id}>
                <p className="mb-2 text-sm font-medium text-ink/70">
                  Opciones habilitadas para este producto
                </p>
                {group.options.length === 0 ? (
                  <p className="text-xs text-ink/50">
                    Esta variante todavía no tiene opciones cargadas.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {group.options.map((opt) => (
                      <div key={opt.key} className="flex flex-wrap items-center gap-2">
                        <label className="flex w-56 items-center gap-2 text-sm text-ink/80">
                          <input
                            type="checkbox"
                            name={`variantOptionKeys_${i}`}
                            value={opt.key}
                            defaultChecked={enabledSet.has(opt.key)}
                          />
                          {opt.label}
                        </label>
                        <input
                          type="text"
                          name={`optionNote_${i}_${opt.key}`}
                          placeholder="Nota opcional (ej: ~500g aprox.)"
                          defaultValue={slot.optionNotes[opt.key] ?? ""}
                          className="flex-1 min-w-[180px] rounded-lg border border-line px-2 py-1 text-xs"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
