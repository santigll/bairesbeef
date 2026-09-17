"use client";

import { useActionState } from "react";
import { addOption, type AddOptionFormState } from "@/app/admin/variantes/actions";

const initialState: AddOptionFormState = {};

export default function AddOptionForm({ groupId }: { groupId: string }) {
  const [state, formAction, pending] = useActionState(addOption, initialState);

  return (
    <div>
      <form action={formAction} className="mt-3 flex flex-wrap gap-2">
        <input type="hidden" name="groupId" value={groupId} />
        <input
          name="label"
          type="text"
          placeholder="Nueva opción, ej: Bifes de 3cm"
          className="flex-1 min-w-[180px] rounded-lg border border-line px-3 py-1.5 text-sm"
        />
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg border border-line px-3 py-1.5 text-sm text-ink/70 hover:border-ink/40 disabled:opacity-50"
        >
          {pending ? "..." : "+ Opción"}
        </button>
      </form>
      {state.error && <p className="mt-1 text-xs text-accent-dark">{state.error}</p>}
    </div>
  );
}
