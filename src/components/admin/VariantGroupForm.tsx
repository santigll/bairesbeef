"use client";

import { useActionState } from "react";
import { upsertGroup, type VariantGroupFormState } from "@/app/admin/variantes/actions";

const initialState: VariantGroupFormState = {};

export default function VariantGroupForm({
  group,
  compact = false,
}: {
  group?: { id: string; name: string };
  compact?: boolean;
}) {
  const [state, formAction, pending] = useActionState(upsertGroup, initialState);

  if (compact) {
    return (
      <div>
        <form action={formAction} className="flex items-center gap-2">
          <input type="hidden" name="id" value={group!.id} />
          <input
            name="name"
            type="text"
            defaultValue={group!.name}
            className="rounded-lg border border-line px-3 py-1.5 text-sm font-medium"
          />
          <button
            type="submit"
            disabled={pending}
            className="rounded-lg border border-line px-3 py-1.5 text-sm text-ink/70 hover:border-ink/40 disabled:opacity-50"
          >
            {pending ? "..." : "Guardar"}
          </button>
        </form>
        {state.error && <p className="mt-1 text-xs text-accent-dark">{state.error}</p>}
      </div>
    );
  }

  return (
    <div>
      <form action={formAction} className="mt-4 flex flex-wrap gap-3">
        <input
          name="name"
          type="text"
          required
          placeholder="Ej: Ahumado"
          className="flex-1 min-w-[200px] rounded-lg border border-line px-3 py-2 text-sm"
        />
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-ink px-5 py-2.5 text-sm font-semibold text-paper hover:bg-accent disabled:opacity-50"
        >
          {pending ? "Agregando..." : "Agregar"}
        </button>
      </form>
      {state.error && <p className="mt-2 text-sm text-accent-dark">{state.error}</p>}
    </div>
  );
}
