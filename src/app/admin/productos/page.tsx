import Image from "next/image";
import AdminShell from "@/components/admin/AdminShell";
import ProductVariantFields from "@/components/admin/ProductVariantFields";
import { getCategories, getProducts, getVariantGroups } from "@/lib/data";
import { formatPrice } from "@/lib/whatsapp";
import type { VariantGroup } from "@/lib/types";
import { deleteProduct, upsertProduct } from "./actions";

export default async function AdminProductosPage() {
  const [products, categories, variantGroups] = await Promise.all([
    getProducts(),
    getCategories(),
    getVariantGroups(),
  ]);

  const categoryName = (id: string) =>
    categories.find((c) => c.id === id)?.name || "Sin categoría";

  return (
    <AdminShell>
      <div className="space-y-8">
        <section className="rounded-2xl border border-line bg-white p-6">
          <h2 className="font-display text-2xl tracking-wide text-ink">
            Nuevo producto
          </h2>
          <ProductForm categories={categories} variantGroups={variantGroups} />
        </section>

        <section>
          <h2 className="mb-4 font-display text-2xl tracking-wide text-ink">
            Productos ({products.length})
          </h2>

          {categories.length === 0 ? (
            <p className="text-ink/60">Creá primero una categoría.</p>
          ) : (
            <div className="space-y-3">
              {products.map((product) => (
                <details
                  key={product.id}
                  className="group rounded-xl border border-line bg-white"
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-4">
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
                          {categoryName(product.categoryId)} ·{" "}
                          {formatPrice(product.price)} / {product.unit}
                        </p>
                      </div>
                    </div>
                    <span className="text-sm text-ink/40 group-open:rotate-180 transition-transform">
                      ▾
                    </span>
                  </summary>

                  <div className="border-t border-line p-4">
                    <ProductForm
                      categories={categories}
                      variantGroups={variantGroups}
                      product={product}
                    />
                    <form action={deleteProduct} className="mt-3">
                      <input type="hidden" name="id" value={product.id} />
                      <button
                        type="submit"
                        className="text-sm font-medium text-accent hover:underline"
                      >
                        Eliminar producto
                      </button>
                    </form>
                  </div>
                </details>
              ))}
            </div>
          )}
        </section>
      </div>
    </AdminShell>
  );
}

function ProductForm({
  categories,
  variantGroups,
  product,
}: {
  categories: { id: string; name: string }[];
  variantGroups: VariantGroup[];
  product?: {
    id: string;
    name: string;
    categoryId: string;
    unit: string;
    price: number;
    description: string;
    active: boolean;
    featured: boolean;
    imageUrl: string;
    variantGroupId?: string;
    variantOptionKeys?: string[];
    optionNotes?: Record<string, string>;
  };
}) {
  return (
    <form action={upsertProduct} className="grid gap-4 sm:grid-cols-2">
      {product && <input type="hidden" name="id" value={product.id} />}

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

      <ProductVariantFields
        groups={variantGroups}
        initialGroupId={product?.variantGroupId}
        initialOptionKeys={product?.variantOptionKeys}
        initialNotes={product?.optionNotes}
      />

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
