"use client";

import { useActionState } from "react";
import { upsertBanner, type BannerFormState } from "@/app/admin/banners/actions";

const initialState: BannerFormState = {};

export default function BannerForm({
  banner,
}: {
  banner?: {
    id: string;
    title: string;
    subtitle: string;
    linkUrl: string;
    active: boolean;
    imageUrl: string;
  };
}) {
  const [state, formAction, pending] = useActionState(upsertBanner, initialState);

  return (
    <form action={formAction} className="grid gap-4 sm:grid-cols-2">
      {banner && <input type="hidden" name="id" value={banner.id} />}

      <div>
        <label className="mb-1 block text-sm font-medium text-ink/70">Título</label>
        <input
          name="title"
          type="text"
          required
          defaultValue={banner?.title}
          className="w-full rounded-lg border border-line px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-ink/70">
          Link (a dónde lleva al tocarlo)
        </label>
        <input
          name="linkUrl"
          type="text"
          defaultValue={banner?.linkUrl ?? "/tienda"}
          className="w-full rounded-lg border border-line px-3 py-2 text-sm"
        />
      </div>

      <div className="sm:col-span-2">
        <label className="mb-1 block text-sm font-medium text-ink/70">Subtítulo</label>
        <input
          name="subtitle"
          type="text"
          defaultValue={banner?.subtitle}
          className="w-full rounded-lg border border-line px-3 py-2 text-sm"
        />
      </div>

      <div className="sm:col-span-2">
        <label className="mb-1 block text-sm font-medium text-ink/70">
          Imagen {banner?.imageUrl ? "(dejar vacío para mantener la actual)" : ""}
        </label>
        <input
          name="image"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="block w-full text-sm"
        />
        {banner?.imageUrl && (
          <label className="mt-2 flex items-center gap-2 text-sm text-ink/60">
            <input type="checkbox" name="removeImage" />
            Quitar imagen actual
          </label>
        )}
      </div>

      <div>
        <label className="flex items-center gap-2 text-sm text-ink/70">
          <input type="checkbox" name="active" defaultChecked={banner?.active ?? true} />
          Activo
        </label>
      </div>

      {state.error && (
        <div className="rounded-lg bg-accent/10 p-3 text-sm text-accent-dark sm:col-span-2">
          {state.error}
        </div>
      )}

      <div className="sm:col-span-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-ink px-5 py-2.5 text-sm font-semibold text-paper hover:bg-accent disabled:opacity-50"
        >
          {pending ? "Guardando..." : banner ? "Guardar cambios" : "Crear banner"}
        </button>
      </div>
    </form>
  );
}
