import Image from "next/image";
import AdminShell from "@/components/admin/AdminShell";
import BannerForm from "@/components/admin/BannerForm";
import { getBanners } from "@/lib/data";
import { deleteBanner, moveBanner } from "./actions";

// See src/app/page.tsx for why every page reading data/*.json needs this.
export const dynamic = "force-dynamic";

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
