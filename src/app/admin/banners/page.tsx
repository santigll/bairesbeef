import Image from "next/image";
import AdminShell from "@/components/admin/AdminShell";
import { getBanners } from "@/lib/data";
import { deleteBanner, moveBanner, upsertBanner } from "./actions";

export default async function AdminBannersPage() {
  const banners = await getBanners();

  return (
    <AdminShell>
      <div className="space-y-8">
        <div>
          <h1 className="font-display text-3xl tracking-wide text-ink">Banners</h1>
          <p className="mt-1 text-sm text-ink/60">
            El carrusel que aparece arriba de todo en la página de Productos.
            Usalo para ofertas, novedades o cualquier comunicación puntual.
          </p>
        </div>

        <section className="rounded-2xl border border-line bg-white p-6">
          <h2 className="font-display text-xl tracking-wide text-ink">
            Nuevo banner
          </h2>
          <BannerForm />
        </section>

        <section className="space-y-3">
          {banners.length === 0 && (
            <p className="text-sm text-ink/60">Todavía no hay banners.</p>
          )}
          {banners.map((banner, i) => (
            <details key={banner.id} className="group rounded-xl border border-line bg-white">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-4">
                <div className="flex items-center gap-3">
                  <div className="relative h-12 w-20 flex-none overflow-hidden rounded-lg bg-paper-alt">
                    {banner.imageUrl && (
                      <Image
                        src={banner.imageUrl}
                        alt={banner.title}
                        fill
                        sizes="80px"
                        className="object-cover"
                      />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-ink">
                      {banner.title}{" "}
                      {!banner.active && (
                        <span className="ml-1 rounded bg-line px-1.5 py-0.5 text-xs text-ink/50">
                          inactivo
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-ink/50">{banner.subtitle}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <form action={moveBanner}>
                    <input type="hidden" name="id" value={banner.id} />
                    <input type="hidden" name="direction" value="up" />
                    <button
                      type="submit"
                      disabled={i === 0}
                      className="text-ink/40 hover:text-ink disabled:opacity-20"
                    >
                      ▲
                    </button>
                  </form>
                  <form action={moveBanner}>
                    <input type="hidden" name="id" value={banner.id} />
                    <input type="hidden" name="direction" value="down" />
                    <button
                      type="submit"
                      disabled={i === banners.length - 1}
                      className="text-ink/40 hover:text-ink disabled:opacity-20"
                    >
                      ▼
                    </button>
                  </form>
                  <span className="text-sm text-ink/40 group-open:rotate-180 transition-transform">
                    ▾
                  </span>
                </div>
              </summary>
              <div className="border-t border-line p-4">
                <BannerForm banner={banner} />
                <form action={deleteBanner} className="mt-3">
                  <input type="hidden" name="id" value={banner.id} />
                  <button
                    type="submit"
                    className="text-sm font-medium text-accent hover:underline"
                  >
                    Eliminar banner
                  </button>
                </form>
              </div>
            </details>
          ))}
        </section>
      </div>
    </AdminShell>
  );
}

function BannerForm({
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
  return (
    <form action={upsertBanner} className="grid gap-4 sm:grid-cols-2">
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

      <div className="sm:col-span-2">
        <button
          type="submit"
          className="rounded-lg bg-ink px-5 py-2.5 text-sm font-semibold text-paper hover:bg-accent"
        >
          {banner ? "Guardar cambios" : "Crear banner"}
        </button>
      </div>
    </form>
  );
}
