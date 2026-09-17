import Image from "next/image";
import AdminShell from "@/components/admin/AdminShell";
import ProductVariantFields from "@/components/admin/ProductVariantFields";
import PieceFormatFields from "@/components/admin/PieceFormatFields";
import ImportProductsForm from "@/components/admin/ImportProductsForm";
import { getCategories, getProducts, getVariantGroups } from "@/lib/data";
import { formatPrice } from "@/lib/whatsapp";
import {
  COOKING_METHODS,
  type PieceFormat,
  type ProductVariantSelection,
  type VariantGroup,
} from "@/lib/types";
import { deleteProduct, moveProduct, upsertProduct } from "./actions";

export default async function AdminProductosPage() {
  const [products, categories, variantGroups] = await Promise.all([
    getProducts(),
    getCategories(),
    getVariantGroups(),
  ]);

  const productsByCategory = categories.map((category) => ({
    category,
    products: products
      .filter((p) => p.categoryId === category.id)
      .sort((a, b) => a.order - b.order),
  }));
  const uncategorized = products.filter(
    (p) => !categories.some((c) => c.id === p.categoryId)
  );

  return (
    <AdminShell>
      <div className="space-y-8">
        <section className="rounded-2xl border border-line bg-white p-6">
          <h2 className="font-display text-2xl tracking-wide text-ink">
            Importar / exportar
          </h2>
          <p className="mt-1 text-sm text-ink/60">
            Para cargar o actualizar muchos productos a la vez (por ejemplo,
            todos los precios): exportá el catálogo actual a CSV, editalo en
            Excel o Google Sheets, y volvé a importarlo. Cada fila se
            identifica por su <span className="font-medium">código</span>: si
            el código ya existe se actualiza ese producto, si no existe se
            crea uno nuevo. Si tildás{" "}
            <span className="font-medium">&quot;Reemplazar catálogo completo&quot;</span>,
            además se elimina cualquier producto que no esté en el archivo
            (útil para subir tu planilla maestra entera de una). El CSV
            también admite una columna opcional{" "}
            <span className="font-mono">peso_aprox_kg</span> para el peso
            aproximado. Las fotos, las variantes y los formatos de venta
            (pieza entera, bolsas, trozos) no se manejan por CSV, esos se
            cargan a mano en cada producto.
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-4">
            <a
              href="/admin/productos/export"
              className="rounded-lg border border-line px-4 py-2 text-sm font-medium text-ink/70 hover:border-ink/40"
            >
              Descargar catálogo actual (CSV)
            </a>
            <ImportProductsForm />
          </div>
        </section>

        <section className="rounded-2xl border border-line bg-white p-6">
          <h2 className="font-display text-2xl tracking-wide text-ink">
            Nuevo producto
          </h2>
          <ProductForm categories={categories} variantGroups={variantGroups} />
        </section>

        <section>
          <h2 className="mb-1 font-display text-2xl tracking-wide text-ink">
            Productos ({products.length})
          </h2>
          <p className="mb-4 text-sm text-ink/60">
            El orden dentro de cada categoría es el orden en que se muestran
            los cortes en la tienda — usá las flechas para acomodarlo.
          </p>

          {categories.length === 0 ? (
            <p className="text-ink/60">Creá primero una categoría.</p>
          ) : (
            <div className="space-y-8">
              {productsByCategory.map(({ category, products: catProducts }) => (
                <div key={category.id}>
                  <h3 className="mb-3 font-display text-lg tracking-wide text-ink/70">
                    {category.name} ({catProducts.length})
                  </h3>
                  {catProducts.length === 0 ? (
                    <p className="text-sm text-ink/40">Sin productos todavía.</p>
                  ) : (
                    <div className="space-y-3">
                      {catProducts.map((product, i) => (
                        <ProductRow
                          key={product.id}
                          product={product}
                          categories={categories}
                          variantGroups={variantGroups}
                          isFirst={i === 0}
                          isLast={i === catProducts.length - 1}
                        />
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {uncategorized.length > 0 && (
                <div>
                  <h3 className="mb-3 font-display text-lg tracking-wide text-ink/70">
                    Sin categoría ({uncategorized.length})
                  </h3>
                  <div className="space-y-3">
                    {uncategorized.map((product) => (
                      <ProductRow
                        key={product.id}
                        product={product}
                        categories={categories}
                        variantGroups={variantGroups}
                        isFirst
                        isLast
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </section>
      </div>
    </AdminShell>
  );
}

type AdminProduct = {
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

function ProductRow({
  product,
  categories,
  variantGroups,
  isFirst,
  isLast,
}: {
  product: AdminProduct;
  categories: { id: string; name: string }[];
  variantGroups: VariantGroup[];
  isFirst: boolean;
  isLast: boolean;
}) {
  return (
    <div className="flex items-stretch gap-2 rounded-xl border border-line bg-white p-4">
      <div className="flex flex-none flex-col justify-center gap-0.5">
        <form action={moveProduct}>
          <input type="hidden" name="id" value={product.id} />
          <input type="hidden" name="direction" value="up" />
          <button
            type="submit"
            disabled={isFirst}
            aria-label={`Subir ${product.name}`}
            className="block leading-none text-ink/40 hover:text-ink disabled:opacity-20"
          >
            ▲
          </button>
        </form>
        <form action={moveProduct}>
          <input type="hidden" name="id" value={product.id} />
          <input type="hidden" name="direction" value="down" />
          <button
            type="submit"
            disabled={isLast}
            aria-label={`Bajar ${product.name}`}
            className="block leading-none text-ink/40 hover:text-ink disabled:opacity-20"
          >
            ▼
          </button>
        </form>
      </div>

      <details className="group flex-1">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="relative h-12 w-12 flex-none overflow-hidden rounded-lg bg-paper-alt">
              {product.imageUrl && (
                <Image
                  src={product.imageUrl}
                  alt={product.name}
                  fill
                  sizes="48px"
                  className="object-cover"
                />
              )}
            </div>
            <div>
              <p className="font-medium text-ink">
                {product.name}{" "}
                {!product.active && (
                  <span className="ml-1 rounded bg-line px-1.5 py-0.5 text-xs text-ink/50">
                    inactivo
                  </span>
                )}
              </p>
              <p className="text-xs text-ink/50">
                <span className="font-mono">{product.code}</span> ·{" "}
                {formatPrice(product.price)} / {product.unit}
              </p>
            </div>
          </div>
          <span className="text-sm text-ink/40 group-open:rotate-180 transition-transform">
            ▾
          </span>
        </summary>

        <div className="mt-4 border-t border-line pt-4">
          <ProductForm categories={categories} variantGroups={variantGroups} product={product} />
          <form action={deleteProduct} className="mt-3">
            <input type="hidden" name="id" value={product.id} />
            <button type="submit" className="text-sm font-medium text-accent hover:underline">
              Eliminar producto
            </button>
          </form>
        </div>
      </details>
    </div>
  );
}

function ProductForm({
  categories,
  variantGroups,
  product,
}: {
  categories: { id: string; name: string }[];
  variantGroups: VariantGroup[];
  product?: AdminProduct;
}) {
  return (
    <form action={upsertProduct} className="grid gap-4 sm:grid-cols-2">
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
          Es solo informativo: se muestra como &quot;≈X kg&quot; al lado del
          precio, sin afectar el cálculo (la unidad ya tiene precio fijo).
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

      <div className="sm:col-span-2">
        <button
          type="submit"
          className="rounded-lg bg-ink px-5 py-2.5 text-sm font-semibold text-paper hover:bg-accent"
        >
          {product ? "Guardar cambios" : "Crear producto"}
        </button>
      </div>
    </form>
  );
}
