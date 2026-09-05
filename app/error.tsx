"use client";

import { useEffect } from "react";

export default function GlobalErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-16 text-center text-foreground">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,rgba(163,230,53,0.04),transparent_60%)]"
      />
      <div className="mx-auto max-w-md space-y-6">
        <h1 className="font-display text-4xl font-bold tracking-tight sm:text-5xl">
          Terjadi Kesalahan
        </h1>
        <p className="text-base text-muted-foreground">
          Maaf, ada yang tidak beres. Silakan coba lagi.
        </p>
        <button
          type="button"
          onClick={reset}
          className="inline-flex h-12 items-center rounded-lg bg-lime-400 px-6 text-base font-medium text-zinc-950 transition-colors hover:bg-lime-300"
        >
          Coba Lagi
        </button>
      </div>
    </div>
  );
}