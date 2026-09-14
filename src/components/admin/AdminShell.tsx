"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAction } from "@/app/admin/login/actions";

const LINKS = [
  { href: "/admin/productos", label: "Productos" },
  { href: "/admin/categorias", label: "Categorías" },
  { href: "/admin/configuracion", label: "Configuración" },
];

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-paper-alt">
      <header className="border-b border-line bg-ink text-paper">
        <div className="container-page flex h-16 items-center justify-between">
          <span className="font-display text-xl tracking-wide">
            Baires Beef · Admin
          </span>
          <div className="flex items-center gap-4">
            <Link href="/" target="_blank" className="text-sm text-paper/70 hover:text-paper">
              Ver sitio ↗
            </Link>
            <form action={logoutAction}>
              <button
                type="submit"
                className="rounded-lg border border-paper/30 px-3 py-1.5 text-sm hover:border-paper"
              >
                Cerrar sesión
              </button>
            </form>
          </div>
        </div>
      </header>

      <div className="container-page flex flex-col gap-6 py-8 md:flex-row">
        <nav className="flex flex-row gap-2 md:w-48 md:flex-col">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                pathname.startsWith(link.href)
                  ? "bg-ink text-paper"
                  : "text-ink/70 hover:bg-white"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
