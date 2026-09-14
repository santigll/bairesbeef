"use client";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-paper-alt p-6">
      <div className="max-w-md rounded-2xl border border-line bg-white p-8 text-center">
        <h1 className="font-display text-2xl tracking-wide text-ink">
          Ocurrió un error
        </h1>
        <p className="mt-2 text-sm text-ink/60">{error.message}</p>
        <button
          type="button"
          onClick={reset}
          className="mt-5 rounded-lg bg-ink px-5 py-2.5 text-sm font-semibold text-paper hover:bg-accent"
        >
          Volver a intentar
        </button>
      </div>
    </div>
  );
}
