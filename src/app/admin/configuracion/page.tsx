import Image from "next/image";
import AdminShell from "@/components/admin/AdminShell";
import { getSettings } from "@/lib/data";
import { updateSettings } from "./actions";

export default async function AdminConfiguracionPage() {
  const settings = await getSettings();

  return (
    <AdminShell>
      <section className="rounded-2xl border border-line bg-white p-6">
        <h2 className="font-display text-2xl tracking-wide text-ink">
          Configuración general
        </h2>
        <p className="mt-1 text-sm text-ink/60">
          Estos datos se usan en toda la web: encabezado, pie de página y los
          botones de WhatsApp.
        </p>

        <form action={updateSettings} className="mt-6 grid gap-5 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-ink/70">
              Nombre de la tienda
            </label>
            <input
              name="storeName"
              defaultValue={settings.storeName}
              className="w-full rounded-lg border border-line px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-ink/70">
              Tagline (ej: Frigorífico)
            </label>
            <input
              name="tagline"
              defaultValue={settings.tagline}
              className="w-full rounded-lg border border-line px-3 py-2 text-sm"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm font-medium text-ink/70">
              Logo
            </label>
            <div className="flex items-center gap-4">
              <Image
                src={settings.logoUrl || "/logo.svg"}
                alt="Logo actual"
                width={56}
                height={56}
                className="rounded-lg border border-line"
              />
              <input
                name="logo"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="block text-sm"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-ink/70">
              WhatsApp minorista (con código de país)
            </label>
            <input
              name="whatsappMinorista"
              defaultValue={settings.whatsappMinorista}
              placeholder="5491122223333"
              className="w-full rounded-lg border border-line px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-ink/70">
              WhatsApp mayorista
            </label>
            <input
              name="whatsappMayorista"
              defaultValue={settings.whatsappMayorista}
              placeholder="5491122223333"
              className="w-full rounded-lg border border-line px-3 py-2 text-sm"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm font-medium text-ink/70">
              Texto de introducción mayorista
            </label>
            <textarea
              name="mayoristaIntro"
              rows={3}
              defaultValue={settings.mayoristaIntro}
              className="w-full rounded-lg border border-line px-3 py-2 text-sm"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm font-medium text-ink/70">
              Beneficios mayoristas (uno por línea)
            </label>
            <textarea
              name="mayoristaBullets"
              rows={4}
              defaultValue={settings.mayoristaBullets.join("\n")}
              className="w-full rounded-lg border border-line px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-ink/70">
              Nota de pedido mínimo mayorista
            </label>
            <input
              name="minOrderNote"
              defaultValue={settings.minOrderNote}
              className="w-full rounded-lg border border-line px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-ink/70">
              Email
            </label>
            <input
              name="email"
              type="email"
              defaultValue={settings.email}
              className="w-full rounded-lg border border-line px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-ink/70">
              Dirección
            </label>
            <input
              name="address"
              defaultValue={settings.address}
              className="w-full rounded-lg border border-line px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-ink/70">
              Horarios
            </label>
            <input
              name="hours"
              defaultValue={settings.hours}
              className="w-full rounded-lg border border-line px-3 py-2 text-sm"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm font-medium text-ink/70">
              Instagram (URL)
            </label>
            <input
              name="instagram"
              defaultValue={settings.instagram}
              className="w-full rounded-lg border border-line px-3 py-2 text-sm"
            />
          </div>

          <div className="sm:col-span-2">
            <button
              type="submit"
              className="rounded-lg bg-ink px-6 py-2.5 text-sm font-semibold text-paper hover:bg-accent"
            >
              Guardar configuración
            </button>
          </div>
        </form>
      </section>
    </AdminShell>
  );
}
