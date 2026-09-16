"use client";

import { useActionState } from "react";
import { importProducts, type ImportResult } from "@/app/admin/productos/csv-actions";

const initialState: ImportResult = { created: 0, updated: 0, errors: [] };

export default function ImportProductsForm() {
  const [state, formAction, pending] = useActionState(importProducts, initialState);

  return (
    <div>
      <form action={formAction} className="flex flex-wrap items-center gap-3">
        <input
          name="file"
          type="file"
          accept=".csv,text/csv"
          required
          className="text-sm"
        />
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-ink px-4 py-2 text-sm font-semibold text-paper hover:bg-accent disabled:opacity-50"
        >
          {pending ? "Importando..." : "Importar CSV"}
        </button>
      </form>

      {(state.created > 0 || state.updated > 0 || state.errors.length > 0) && (
        <div className="mt-3 space-y-1 text-sm">
          {(state.created > 0 || state.updated > 0) && (
            <p className="text-flag-dark">
              {state.created > 0 && `${state.created} producto${state.created === 1 ? "" : "s"} creado${state.created === 1 ? "" : "s"}. `}
              {state.updated > 0 && `${state.updated} producto${state.updated === 1 ? "" : "s"} actualizado${state.updated === 1 ? "" : "s"}.`}
            </p>
          )}
          {state.errors.length > 0 && (
            <div className="rounded-lg bg-accent/10 p-3 text-accent-dark">
              <p className="font-medium">
                {state.errors.length} fila{state.errors.length === 1 ? "" : "s"} con problemas:
              </p>
              <ul className="mt-1 list-inside list-disc space-y-0.5">
                {state.errors.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
