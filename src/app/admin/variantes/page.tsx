import AdminShell from "@/components/admin/AdminShell";
import VariantGroupForm from "@/components/admin/VariantGroupForm";
import AddOptionForm from "@/components/admin/AddOptionForm";
import { getProducts, getVariantGroups } from "@/lib/data";
import { deleteGroup, removeOption } from "./actions";

// See src/app/page.tsx for why every page reading data/*.json needs this.
export const dynamic = "force-dynamic";

export default async function AdminVariantesPage() {
  const [groups, products] = await Promise.all([getVariantGroups(), getProducts()]);

  const productCountFor = (groupId: string) =>
    products.filter((p) => p.variantSelections?.some((sel) => sel.groupId === groupId))
      .length;

  return (
    <AdminShell>
      <div className="space-y-8">
        <div>
          <h1 className="font-display text-3xl tracking-wide text-ink">Variantes</h1>
          <p className="mt-1 text-sm text-ink/60">
            Definí formas de presentación (picado, bifes, marcado, etc.) que
            después le podés asignar a cada producto desde su ficha, eligiendo
            cuáles de estas opciones aplican en cada caso.
          </p>
        </div>

        <section className="rounded-2xl border border-line bg-white p-6">
          <h2 className="font-display text-xl tracking-wide text-ink">
            Nueva variante
          </h2>
          <VariantGroupForm />
        </section>

        <section className="space-y-4">
          {groups.map((group) => {
            const count = productCountFor(group.id);
            return (
              <div key={group.id} className="rounded-2xl border border-line bg-white p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <VariantGroupForm group={group} compact />

                  {count === 0 ? (
                    <form action={deleteGroup}>
                      <input type="hidden" name="id" value={group.id} />
                      <button
                        type="submit"
                        className="text-sm font-medium text-accent hover:underline"
                      >
                        Eliminar variante
                      </button>
                    </form>
                  ) : (
                    <span className="text-xs text-ink/40">
                      Usada en {count} producto{count === 1 ? "" : "s"}
                    </span>
                  )}
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {group.options.map((opt) => (
                    <form
                      key={opt.key}
                      action={removeOption}
                      className="flex items-center gap-1.5 rounded-full border border-line bg-paper-alt px-3 py-1 text-xs"
                    >
                      <input type="hidden" name="groupId" value={group.id} />
                      <input type="hidden" name="key" value={opt.key} />
                      <span className="text-ink/80">{opt.label}</span>
                      <button
                        type="submit"
                        aria-label={`Quitar ${opt.label}`}
                        className="text-ink/40 hover:text-accent"
                      >
                        ✕
                      </button>
                    </form>
                  ))}
                  {group.options.length === 0 && (
                    <span className="text-xs text-ink/40">Sin opciones todavía.</span>
                  )}
                </div>

                <AddOptionForm groupId={group.id} />
              </div>
            );
          })}
        </section>
      </div>
    </AdminShell>
  );
}
