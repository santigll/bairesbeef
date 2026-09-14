import Image from "next/image";
import { loginAction } from "./actions";

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  const params = await searchParams;

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink px-4 py-12">
      <div className="w-full max-w-sm rounded-2xl bg-paper p-8 shadow-xl">
        <div className="mb-6 flex flex-col items-center text-center">
          <Image src="/logo.svg" alt="Baires Beef" width={64} height={64} className="rounded-xl" />
          <h1 className="mt-3 font-display text-2xl tracking-wide text-ink">
            Panel de administración
          </h1>
          <p className="text-sm text-ink/60">Baires Beef</p>
        </div>

        {params.error && (
          <p className="mb-4 rounded-lg bg-accent/10 px-3 py-2 text-sm text-accent-dark">
            Usuario o contraseña incorrectos.
          </p>
        )}

        <form action={loginAction} className="space-y-4">
          <input type="hidden" name="next" value={params.next || "/admin/productos"} />
          <div>
            <label className="mb-1 block text-sm font-medium text-ink/70">
              Usuario
            </label>
            <input
              name="username"
              type="text"
              required
              autoFocus
              className="w-full rounded-lg border border-line px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-ink/70">
              Contraseña
            </label>
            <input
              name="password"
              type="password"
              required
              className="w-full rounded-lg border border-line px-3 py-2 text-sm"
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-lg bg-ink px-4 py-2.5 text-sm font-semibold text-paper hover:bg-accent"
          >
            Ingresar
          </button>
        </form>
      </div>
    </div>
  );
}
