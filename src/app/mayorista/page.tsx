import type { Metadata } from "next";
import { getSettings } from "@/lib/data";
import { waLink } from "@/lib/whatsapp";
import MayoristaForm from "@/components/MayoristaForm";

export const metadata: Metadata = {
  title: "Mayorista | Baires Beef",
  description: "Venta mayorista de carne para restaurantes, parrillas y comercios.",
};

// See src/app/page.tsx for why this is needed on every page reading data/*.json.
export const dynamic = "force-dynamic";

export default async function MayoristaPage() {
  const settings = await getSettings();
  const quickHref = waLink(
    settings.whatsappMayorista,
    "Hola Baires Beef! Quiero consultar por precios mayoristas para mi negocio."
  );

  return (
    <div>
      <section className="bg-ink py-16 text-paper">
        <div className="container-page">
          <p className="font-display text-lg tracking-widest text-flag">
            MAYORISTA
          </p>
          <h1 className="font-display text-4xl tracking-wide sm:text-5xl">
            Carne para tu negocio
          </h1>
          <p className="mt-4 max-w-2xl text-paper/70">
            {settings.mayoristaIntro}
          </p>
          <a
            href={quickHref}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-7 inline-flex items-center gap-2 rounded-lg bg-[#25D366] px-7 py-3.5 text-sm font-bold uppercase tracking-wide text-white hover:brightness-95"
          >
            Consultar por WhatsApp
          </a>
        </div>
      </section>

      <section className="container-page py-14">
        <div className="grid gap-10 lg:grid-cols-2">
          <div>
            <h2 className="font-display text-2xl tracking-wide text-ink">
              ¿Por qué elegirnos?
            </h2>
            <ul className="mt-4 space-y-4">
              {settings.mayoristaBullets.map((bullet) => (
                <li key={bullet} className="flex items-start gap-3">
                  <span className="mt-1 flex h-5 w-5 flex-none items-center justify-center rounded-full bg-flag/20 text-xs font-bold text-flag-dark">
                    ✓
                  </span>
                  <span className="text-ink/75">{bullet}</span>
                </li>
              ))}
            </ul>
            {settings.minOrderNote && (
              <p className="mt-6 rounded-lg bg-paper-alt px-4 py-3 text-sm text-ink/70">
                {settings.minOrderNote}
              </p>
            )}
          </div>

          <MayoristaForm phone={settings.whatsappMayorista} />
        </div>
      </section>
    </div>
  );
}
