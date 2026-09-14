import Link from "next/link";
import Image from "next/image";
import type { Settings } from "@/lib/types";

export default function Footer({ settings }: { settings: Settings }) {
  return (
    <footer className="mt-16 border-t border-line bg-ink text-paper/90">
      <div className="container-page grid gap-10 py-12 md:grid-cols-3">
        <div>
          <div className="mb-3 flex items-center gap-3">
            <Image
              src={settings.logoUrl || "/logo.svg"}
              alt={settings.storeName}
              width={40}
              height={40}
              className="rounded-md"
            />
            <span className="font-display text-2xl tracking-wide">
              {settings.storeName}
            </span>
          </div>
          <p className="max-w-xs text-sm text-paper/70">
            Carne argentina de primera calidad, para tu casa o para tu negocio.
          </p>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-paper/60">
            Navegación
          </h3>
          <ul className="space-y-2 text-sm">
            <li><Link href="/tienda" className="hover:text-flag">Tienda</Link></li>
            <li><Link href="/mayorista" className="hover:text-flag">Mayorista</Link></li>
            <li><Link href="/nosotros" className="hover:text-flag">Nosotros</Link></li>
            <li><Link href="/contacto" className="hover:text-flag">Contacto</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-paper/60">
            Contacto
          </h3>
          <ul className="space-y-2 text-sm text-paper/80">
            <li>{settings.address}</li>
            <li>{settings.hours}</li>
            <li>
              <a href={`mailto:${settings.email}`} className="hover:text-flag">
                {settings.email}
              </a>
            </li>
            {settings.instagram && (
              <li>
                <a
                  href={settings.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-flag"
                >
                  Instagram
                </a>
              </li>
            )}
          </ul>
        </div>
      </div>
      <div className="border-t border-paper/10 py-4 text-center text-xs text-paper/50">
        © {new Date().getFullYear()} {settings.storeName}. Todos los derechos reservados.
      </div>
    </footer>
  );
}
