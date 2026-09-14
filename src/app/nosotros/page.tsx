import type { Metadata } from "next";
import Image from "next/image";
import { getSettings } from "@/lib/data";

export const metadata: Metadata = {
  title: "Nosotros | Baires Beef",
  description: "Conocé la historia y los valores de Baires Beef.",
};

export default async function NosotrosPage() {
  const settings = await getSettings();

  const values = [
    {
      title: "Selección cuidada",
      text: "Trabajamos con proveedores de confianza para asegurar cortes parejos y de calidad todo el año.",
    },
    {
      title: "Trato directo",
      text: "Sin intermediarios: hablás con nosotros, resolvemos tu pedido y coordinamos la entrega.",
    },
    {
      title: "Compromiso con el cliente",
      text: "Minorista o mayorista, cada pedido recibe la misma atención y frescura.",
    },
  ];

  return (
    <div className="container-page py-14">
      <div className="grid gap-10 lg:grid-cols-[auto_1fr] lg:items-center">
        <Image
          src={settings.logoUrl || "/logo.svg"}
          alt={settings.storeName}
          width={140}
          height={140}
          className="rounded-2xl shadow-md"
        />
        <div>
          <p className="font-display text-lg tracking-widest text-accent">
            NOSOTROS
          </p>
          <h1 className="font-display text-4xl tracking-wide text-ink sm:text-5xl">
            De la tradición del asado a tu mesa
          </h1>
          <p className="mt-4 max-w-2xl text-ink/70">
            {settings.storeName} nació con una idea simple: llevar carne
            argentina de calidad, con trato cercano, tanto a las casas de
            familia como a los negocios gastronómicos de la ciudad. Cortes
            seleccionados, precios claros y pedidos que se resuelven en
            minutos por WhatsApp.
          </p>
        </div>
      </div>

      <div className="mt-14 grid gap-8 sm:grid-cols-3">
        {values.map((v) => (
          <div key={v.title} className="rounded-xl border border-line bg-white p-6">
            <h3 className="font-display text-xl tracking-wide text-ink">
              {v.title}
            </h3>
            <p className="mt-2 text-sm text-ink/60">{v.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
