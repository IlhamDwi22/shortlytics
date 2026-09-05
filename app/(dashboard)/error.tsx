"use client";

import { useEffect } from "react";
import { RotateCcw } from "lucide-react";

export default function DashboardErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Dashboard error:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-destructive/40 bg-destructive/5 px-6 py-16 text-center">
      <h1 className="font-display text-2xl font-semibold text-foreground">
        Dashboard Gagal Dimuat
      </h1>
      <p className="text-base text-muted-foreground">
        Terjadi kesalahan saat memuat halaman ini.
      </p>
      <button
        type="button"
        onClick={reset}
        className="inline-flex h-10 items-center gap-2 rounded-lg border border-border bg-card px-4 text-sm font-medium text-foreground transition-colors hover:border-lime-400/40"
      >
        <RotateCcw className="size-4" />
        Coba Lagi
      </button>
    </div>
  );
}