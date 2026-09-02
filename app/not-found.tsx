import Link from "next/link";
import { Link2Off, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

const MONO = "font-mono tracking-tight";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-16 text-center text-foreground sm:px-6 lg:px-8">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,rgba(163,230,53,0.04),transparent_60%)]"
      />

      <div className="mx-auto max-w-md space-y-6">
        <div className="mx-auto flex size-20 items-center justify-center rounded-2xl border border-border bg-card">
          <Link2Off className="size-10 text-muted-foreground/60" />
        </div>

        <div className="space-y-2">
          <h1 className="font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            404
          </h1>
          <h2 className="font-display text-xl font-semibold text-foreground">
            Link Tidak Ditemukan
          </h2>
          <p className="text-sm text-muted-foreground">
            Tautan pendek yang Anda akses tidak ditemukan, telah dinonaktifkan,
            atau sudah dihapus oleh pemiliknya.
          </p>
        </div>

        <div className="pt-4">
          <Link
            href="/"
            className={cn(
              MONO,
              "inline-flex h-10 items-center gap-2 rounded-md bg-lime-400 px-5 text-sm font-medium text-zinc-950 transition-colors hover:bg-lime-300 active:scale-[0.98]"
            )}
          >
            <ArrowLeft className="size-4" />
            Kembali ke Beranda
          </Link>
        </div>

        <p className={cn(MONO, "pt-2 text-[11px] text-muted-foreground/70")}>
          shortlytics — developer-grade URL shortener
        </p>
      </div>
    </div>
  );
}
