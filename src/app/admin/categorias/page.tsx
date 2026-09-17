import AdminShell from "@/components/admin/AdminShell";
import CategoryForm from "@/components/admin/CategoryForm";
import { getCategories, getProducts } from "@/lib/data";
import { deleteCategory, moveCategory } from "./actions";

// See src/app/page.tsx for why every page reading data/*.json needs this.
export const dynamic = "force-dynamic";

export default async function AdminCategoriasPage() {
  const [categories, products] = await Promise.all([
    getCategories(),
    getProducts(),
  ]);

  const countFor = (categoryId: string) =>
    products.filter((p) => p.categoryId === categoryId).length;

  return (
    <AdminShell>
      <div className="space-y-8">
        <section className="rounded-2xl border border-line bg-white p-6">
          <h2 className="font-display text-2xl tracking-wide text-ink">
            Nueva categoría
          </h2>
          <CategoryForm />
        </section>

        <section>
          <h2 className="mb-4 font-display text-2xl tracking-wide text-ink">
            Categorías ({categories.length})
          </h2>
          <div className="space-y-2">
            {categories.map((cat, i) => {
              const count = countFor(cat.id);
              return (
                <div
                  key={cat.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-white p-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col">
                      <form action={moveCategory}>
                        <input type="hidden" name="id" value={cat.id} />
                        <input type="hidden" name="direction" value="up" />
                        <button
                          type="submit"
                          disabled={i === 0}
                          className="block leading-none text-ink/40 hover:text-ink disabled:opacity-20"
                        >
                          ▲
                        </button>
                      </form>
                      <form action={moveCategory}>
                        <input type="hidden" name="id" value={cat.id} />
                        <input type="hidden" name="direction" value="down" />
                        <button
                          type="submit"
                          disabled={i === categories.length - 1}
                          className="block leading-none text-ink/40 hover:text-ink disabled:opacity-20"
                        >
                          ▼
                        </button>
                      </form>
                    </div>
                    <CategoryForm category={cat} compact />
                    <span className="text-xs text-ink/50">
                      {count} producto{count === 1 ? "" : "s"}
                    </span>
                  </div>

                  {count === 0 ? (
                    <form action={deleteCategory}>
                      <input type="hidden" name="id" value={cat.id} />
                      <button
                        type="submit"
                        className="text-sm font-medium text-accent hover:underline"
                      >
                        Eliminar
                      </button>
                    </form>
                  ) : (
                    <span className="text-xs text-ink/40">
                      Movés sus productos para poder eliminarla
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </AdminShell>
  );
}
