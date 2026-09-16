"use client";

import { useActionState, useState } from "react";
import { importProducts, type ImportResult } from "@/app/admin/productos/csv-actions";

const initialState: ImportResult = { created: 0, updated: 0, deleted: 0, errors: [] };

export default function ImportProductsForm() {
  const [state, formAction, pending] = useActionState(importProducts, initialState);
  const [replaceAll, setReplaceAll] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    if (
      replaceAll &&
      !window.confirm(
        "Esto va a ELIMINAR todos los productos que no estén en el archivo que estás subiendo. ¿Confirmás?"
      )
    ) {
      e.preventDefault();
    }
  }

  return (
    <div>
      <form action={formAction} onSubmit={handleSubmit} className="flex flex-wrap items-center gap-3">
        <input name="file" type="file" accept=".csv,text/csv" required className="text-sm" />
        <label className="flex items-center gap-2 text-sm text-ink/70">
          <input
            type="checkbox"
            name="replaceAll"
            checked={replaceAll}
            onChange={(e) => setReplaceAll(e.target.checked)}
          />
          Reemplazar catálogo completo
        </label>
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-ink px-4 py-2 text-sm font-semibold text-paper hover:bg-accent disabled:opacity-50"
        >
          {pending ? "Importando..." : "Importar CSV"}
        </button>
      </form>
      {replaceAll && (
        <p className="mt-2 text-xs text-accent-dark">
          Ojo: con esto tildado, cualquier producto que no esté en el
          archivo se va a <span className="font-medium">eliminar</span>. Sin
          tildar, el CSV solo crea y actualiza (comportamiento normal).
        </p>
      )}

      {(state.created > 0 || state.updated > 0 || state.deleted > 0 || state.errors.length > 0) && (
        <div className="mt-3 space-y-1 text-sm">
          {(state.created > 0 || state.updated > 0 || state.deleted > 0) && (
            <p className="text-flag-dark">
              {state.created > 0 && `${state.created} producto${state.created === 1 ? "" : "s"} creado${state.created === 1 ? "" : "s"}. `}
              {state.updated > 0 && `${state.updated} producto${state.updated === 1 ? "" : "s"} actualizado${state.updated === 1 ? "" : "s"}. `}
              {state.deleted > 0 && `${state.deleted} producto${state.deleted === 1 ? "" : "s"} eliminado${state.deleted === 1 ? "" : "s"}.`}
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
