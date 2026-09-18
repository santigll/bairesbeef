"use client";

import { useActionState } from "react";
import ProductVariantFields from "@/components/admin/ProductVariantFields";
import PieceFormatFields from "@/components/admin/PieceFormatFields";
import { upsertProduct, type ProductFormState } from "@/app/admin/productos/actions";
import {
  COOKING_METHODS,
  type PieceFormat,
  type ProductVariantSelection,
  type VariantGroup,
} from "@/lib/types";

export type AdminProduct = {
  id: string;
  code: string;
  name: string;
  categoryId: string;
  unit: string;
  price: number;
  description: string;
  active: boolean;
  featured: boolean;
  imageUrl: string;
  cookingMethods: string[];
  variantSelections?: ProductVariantSelection[];
  approxWeightKg?: number;
  pieceFormats?: PieceFormat[];
  offerLoose?: boolean;
};

const initialState: ProductFormState = {};

export default function ProductForm({
  categories,
  variantGroups,
  product,
}: {
  categories: { id: string; name: string }[];
  variantGroups: VariantGroup[];
  product?: AdminProduct;
}) {
  const [state, formAction, pending] = useActionState(upsertProduct, initialState);

  return (
    <form action={formAction} className="grid gap-4 sm:grid-cols-2">
      {product && <input type="hidden" name="id" value={product.id} />}

      <div>
        <label className="mb-1 block text-sm font-medium text-ink/70">
          Código {!product && "(vacío = se genera solo)"}
        </label>
        <input
          name="code"
          type="text"
          defaultValue={product?.code}
          placeholder="Ej: VAC-009"
          className="w-full rounded-lg border border-line px-3 py-2 text-sm font-mono uppercase"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-ink/70">
          Nombre
        </label>
        <input
          name="name"
          type="text"
          required
          defaultValue={product?.name}
          className="w-full rounded-lg border border-line px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-ink/70">
          Categoría
        </label>
        <select
          name="categoryId"
          required
          defaultValue={product?.categoryId ?? categories[0]?.id}
          className="w-full rounded-lg border border-line px-3 py-2 text-sm"
        >
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-ink/70">
          Precio (ARS)
        </label>
        <input
          name="price"
          type="number"
          min={0}
          step={1}
          required
          defaultValue={product?.price}
          className="w-full rounded-lg border border-line px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-ink/70">
          Unidad
        </label>
        <select
          name="unit"
          defaultValue={product?.unit ?? "kg"}
          className="w-full rounded-lg border border-line px-3 py-2 text-sm"
        >
          <option value="kg">Por kg</option>
          <option value="unidad">Por unidad</option>
        </select>
      </div>

      <div className="sm:col-span-2">
        <label className="mb-1 block text-sm font-medium text-ink/70">
          Descripción
        </label>
        <textarea
          name="description"
          rows={2}
          defaultValue={product?.description}
          className="w-full rounded-lg border border-line px-3 py-2 text-sm"
        />
      </div>

      <div className="sm:col-span-2">
        <label className="mb-1 block text-sm font-medium text-ink/70">
          Foto {product?.imageUrl ? "(dejar vacío para mantener la actual)" : ""}
        </label>
        <input
          name="image"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="block w-full text-sm"
        />
        {product?.imageUrl && (
          <label className="mt-2 flex items-center gap-2 text-sm text-ink/60">
            <input type="checkbox" name="removeImage" />
            Quitar foto actual
          </label>
        )}
      </div>

      <PieceFormatFields
        initialFormats={product?.pieceFormats}
        initialOfferLoose={product?.offerLoose}
      />

      <div>
        <label className="mb-1 block text-sm font-medium text-ink/70">
          Peso aprox. (kg){" "}
          <span className="font-normal text-ink/40">
            (solo aplica si la unidad es «Por unidad»)
          </span>
        </label>
        <input
          name="approxWeightKg"
          type="number"
          min={0}
          step={0.01}
          defaultValue={product?.approxWeightKg}
          placeholder="Ej: 1.8"
          className="w-full rounded-lg border border-line px-3 py-2 text-sm"
        />
        <p className="mt-1 text-xs text-ink/50">
          Es solo informativo: se muestra como &quot;X kg aprox&quot; al lado
          del precio, y en la tienda el contador de cantidad va sumando este
          peso (ej: 2,2kg, 4,4kg...) en vez de mostrar &quot;1 u., 2 u.&quot;
          — sin afectar el cálculo, la unidad ya tiene precio fijo.
        </p>
      </div>

      <ProductVariantFields
        groups={variantGroups}
        initialSelections={product?.variantSelections}
      />

      <div className="sm:col-span-2">
        <label className="mb-1 block text-sm font-medium text-ink/70">
          Cocción
        </label>
        <div className="flex flex-wrap gap-4">
          {COOKING_METHODS.map((method) => (
            <label key={method} className="flex items-center gap-2 text-sm text-ink/70">
              <input
                type="checkbox"
                name="cookingMethods"
                value={method}
                defaultChecked={product?.cookingMethods?.includes(method)}
              />
              {method}
            </label>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-6 sm:col-span-2">
        <label className="flex items-center gap-2 text-sm text-ink/70">
          <input
            type="checkbox"
            name="active"
            defaultChecked={product?.active ?? true}
          />
          Activo (visible en la tienda)
        </label>
        <label className="flex items-center gap-2 text-sm text-ink/70">
          <input type="checkbox" name="featured" defaultChecked={product?.featured} />
          Destacado en el inicio
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
          {pending ? "Guardando..." : product ? "Guardar cambios" : "Crear producto"}
        </button>
      </div>
    </form>
  );
}
