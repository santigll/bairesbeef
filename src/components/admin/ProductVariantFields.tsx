"use client";

import { useState } from "react";
import type { VariantGroup } from "@/lib/types";

export default function ProductVariantFields({
  groups,
  initialGroupId,
  initialOptionKeys,
  initialNotes,
}: {
  groups: VariantGroup[];
  initialGroupId?: string;
  initialOptionKeys?: string[];
  initialNotes?: Record<string, string>;
}) {
  const [groupId, setGroupId] = useState(initialGroupId ?? "");
  const group = groups.find((g) => g.id === groupId);
  const enabledSet = new Set(initialOptionKeys ?? []);
  const isInitialGroup = groupId === initialGroupId;

  return (
    <div className="space-y-3 rounded-lg border border-line p-4 sm:col-span-2">
      <div>
        <label className="mb-1 block text-sm font-medium text-ink/70">
          Variante de presentación
        </label>
        <select
          name="variantGroupId"
          value={groupId}
          onChange={(e) => setGroupId(e.target.value)}
          className="w-full rounded-lg border border-line px-3 py-2 text-sm"
        >
          <option value="">Ninguna</option>
          {groups.map((g) => (
            <option key={g.id} value={g.id}>
              {g.name}
            </option>
          ))}
        </select>
        <p className="mt-1 text-xs text-ink/50">
          Definís las variantes disponibles (con sus opciones) en la sección{" "}
          <span className="font-medium">Variantes</span> del menú.
        </p>
      </div>

      {group && (
        <div>
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
                      name="variantOptionKeys"
                      value={opt.key}
                      defaultChecked={isInitialGroup && enabledSet.has(opt.key)}
                    />
                    {opt.label}
                  </label>
                  <input
                    type="text"
                    name={`optionNote_${opt.key}`}
                    placeholder="Nota opcional (ej: ~500g aprox.)"
                    defaultValue={isInitialGroup ? initialNotes?.[opt.key] ?? "" : ""}
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
}
