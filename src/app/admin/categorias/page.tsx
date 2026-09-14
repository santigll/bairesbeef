import AdminShell from "@/components/admin/AdminShell";
import { getCategories, getProducts } from "@/lib/data";
import { deleteCategory, moveCategory, upsertCategory } from "./actions";

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
          <form action={upsertCategory} className="mt-4 flex flex-wrap gap-3">
            <input
              name="name"
              type="text"
              required
              placeholder="Ej: Cordero"
              className="flex-1 min-w-[200px] rounded-lg border border-line px-3 py-2 text-sm"
            />
            <button
              type="submit"
              className="rounded-lg bg-ink px-5 py-2.5 text-sm font-semibold text-paper hover:bg-accent"
            >
              Agregar
            </button>
          </form>
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
                    <form action={upsertCategory} className="flex items-center gap-2">
                      <input type="hidden" name="id" value={cat.id} />
                      <input
                        name="name"
                        type="text"
                        defaultValue={cat.name}
                        className="rounded-lg border border-line px-3 py-1.5 text-sm"
                      />
                      <button
                        type="submit"
                        className="rounded-lg border border-line px-3 py-1.5 text-sm text-ink/70 hover:border-ink/40"
                      >
                        Guardar
                      </button>
                    </form>
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
