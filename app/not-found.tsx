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

      <div className="mx-auto max-w-md space-y-7">
        <div className="mx-auto flex size-24 items-center justify-center rounded-2xl border border-border bg-card">
          <Link2Off className="size-12 text-muted-foreground/60" />
        </div>

        <div className="space-y-2.5">
          <h1 className="font-display text-6xl font-bold tracking-tight text-foreground sm:text-7xl">
            404
          </h1>
          <h2 className="font-display text-2xl font-semibold text-foreground">
            Link not found
          </h2>
          <p className="text-base text-muted-foreground">
            The short link you tried to access does not exist, has been
            deactivated, or was removed by its owner.
          </p>
        </div>

        <div className="pt-4">
          <Link
            href="/"
            className={cn(
              MONO,
              "inline-flex h-12 items-center gap-2 rounded-lg bg-lime-400 px-6 text-base font-medium text-zinc-950 transition-colors hover:bg-lime-300 active:scale-[0.98]"
            )}
          >
            <ArrowLeft className="size-4.5" />
            Back to home
          </Link>
        </div>

        <p className={cn(MONO, "pt-3 text-xs text-muted-foreground/70")}>
          shortlytics — developer-grade URL shortener
        </p>
      </div>
    </div>
  );
}
