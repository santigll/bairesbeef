import type { Metadata } from "next";
import { getSettings } from "@/lib/data";
import { waLink } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "Contacto | Baires Beef",
  description: "Escribinos por WhatsApp, mail o visitanos.",
};

// See src/app/page.tsx for why this is needed on every page reading data/*.json.
export const dynamic = "force-dynamic";

export default async function ContactoPage() {
  const settings = await getSettings();
  const href = waLink(
    settings.whatsappMinorista,
    "Hola Baires Beef! Tengo una consulta."
  );

  return (
    <div className="container-page py-14">
      <p className="font-display text-lg tracking-widest text-accent">
        CONTACTO
      </p>
      <h1 className="font-display text-4xl tracking-wide text-ink sm:text-5xl">
        Hablemos
      </h1>
      <p className="mt-3 max-w-xl text-ink/60">
        Escribinos por WhatsApp para pedidos rápidos, o contactanos por los
        siguientes medios.
      </p>

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <ContactCard title="WhatsApp" value="Escribinos ahora" href={href} accent />
        <ContactCard title="Email" value={settings.email} href={`mailto:${settings.email}`} />
        <ContactCard title="Dirección" value={settings.address} />
        <ContactCard title="Horarios" value={settings.hours} />
        {settings.instagram && (
          <ContactCard title="Instagram" value="@bairesbeef" href={settings.instagram} />
        )}
      </div>
    </div>
  );
}

function ContactCard({
  title,
  value,
  href,
  accent,
}: {
  title: string;
  value: string;
  href?: string;
  accent?: boolean;
}) {
  const content = (
    <div
      className={`rounded-xl border p-6 transition-colors ${
        accent
          ? "border-flag/40 bg-ink text-paper"
          : "border-line bg-white text-ink"
      }`}
    >
      <p
        className={`text-xs font-semibold uppercase tracking-wider ${
          accent ? "text-flag" : "text-ink/50"
        }`}
      >
        {title}
      </p>
      <p className="mt-2 font-medium">{value}</p>
    </div>
  );

  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className="block">
        {content}
      </a>
    );
  }
  return content;
}
