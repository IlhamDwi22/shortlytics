"use client";

import * as React from "react";
import { Search, Link2, Zap, Loader2 } from "lucide-react";
import { LinkForm } from "@/components/link-form";
import { LinkCard } from "@/components/link-card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const MONO = "font-mono tracking-tight";

interface LinkItem {
  id: string;
  shortCode: string;
  shortUrl: string;
  originalUrl: string;
  totalClicks: number;
  createdAt: string;
}

export default function DashboardPage() {
  const [links, setLinks] = React.useState<LinkItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  // Pure fetcher: never touches state so it can be safely invoked from an
  // effect without synchronously calling setState.
  const fetchLinksData = React.useCallback(async () => {
    try {
      const res = await fetch("/api/links");
      const data = await res.json();
      if (!res.ok) {
        return {
          ok: false as const,
          links: [] as LinkItem[],
          message: (data as { message?: string })?.message || "Gagal memuat link.",
        };
      }
      return { ok: true as const, links: (data.links || []) as LinkItem[], message: null };
    } catch {
      return {
        ok: false as const,
        links: [] as LinkItem[],
        message: "Gagal terhubung ke server. Periksa koneksi Anda.",
      };
    }
  }, []);

  const refetchLinks = React.useCallback(async () => {
    setIsRefreshing(true);
    const result = await fetchLinksData();
    setError(result.message);
    if (result.ok) setLinks(result.links);
    setIsLoading(false);
    setIsRefreshing(false);
  }, [fetchLinksData]);

  React.useEffect(() => {
    let cancelled = false;
    async function loadAll() {
      const result = await fetchLinksData();
      if (cancelled) return;
      setLinks(result.links);
      setError(result.message);
    }
    void loadAll().finally(() => {
      if (!cancelled) setIsLoading(false);
    });
    return () => { cancelled = true; };
  }, [fetchLinksData]);

  const filteredLinks = links.filter(
    (link) =>
      link.shortUrl.toLowerCase().includes(searchQuery.toLowerCase()) ||
      link.originalUrl.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = (id: string) => {
    setLinks((prev) => prev.filter((l) => l.id !== id));
  };

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Dashboard
        </h1>
        <p className="mt-2 text-base text-muted-foreground">
          Kelola short link Anda dan pantau performanya.
        </p>
      </div>

      {/* Create link form */}
      <LinkForm onCreated={refetchLinks} />

      {/* Search + count */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-muted-foreground/70" />
          <input
            type="text"
            placeholder="Cari link..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={cn(
              MONO,
              "h-11 w-full rounded-lg border border-border bg-card pl-10 pr-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-border/50 focus:outline-none focus:ring-1 focus:ring-border/30"
            )}
          />
        </div>
        <span className={cn(MONO, "flex items-center gap-2 text-xs text-muted-foreground/70")}>
          {isRefreshing ? (
            <>
              <Loader2 className="size-3.5 animate-spin text-lime-400" />
              menyegarkan...
            </>
          ) : (
            <>
              {links.length} link{links.length !== 1 ? "s" : ""}
            </>
          )}
        </span>
      </div>

      {/* Error state */}
      {error && !isLoading && (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-destructive/40 bg-destructive/5 px-6 py-10 text-center">
          <p className="text-sm text-foreground/80">{error}</p>
          <button
            type="button"
            onClick={() => { setIsLoading(true); void refetchLinks(); }}
            className="inline-flex h-9 items-center rounded-lg border border-border bg-card px-4 text-xs font-medium text-foreground transition-colors hover:border-lime-400/40"
          >
            Coba lagi
          </button>
        </div>
      )}

      {/* Links list */}
      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="rounded-xl border border-border bg-card p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1 space-y-2.5">
                  <Skeleton className="h-5 max-w-[15rem]" />
                  <Skeleton className="h-4 max-w-[18rem]" />
                </div>
                <Skeleton className="h-6 w-20 shrink-0 rounded-md" />
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-border/30 pt-4">
                <Skeleton className="h-4 w-24" />
                <div className="flex gap-2">
                  <Skeleton className="size-8 rounded" />
                  <Skeleton className="size-8 rounded" />
                  <Skeleton className="size-8 rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredLinks.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16 sm:py-20">
          <div className="flex size-14 items-center justify-center rounded-full bg-muted/50">
            <Link2 className="size-7 text-muted-foreground/70" />
          </div>
          <h3 className="mt-5 font-display text-lg font-semibold text-foreground/80">
            {searchQuery ? "Link tidak ditemukan" : "Belum ada link"}
          </h3>
          <p className="mt-1.5 text-sm text-muted-foreground">
            {searchQuery
              ? "Coba kata kunci pencarian lain."
              : "Buat short link pertama Anda di atas untuk memulai."}
          </p>
          {!searchQuery && (
            <div className="mt-5 flex items-center gap-1.5 text-xs text-muted-foreground/70">
              <Zap className="size-3.5 text-lime-400/60" />
              <span className={MONO}>{"< 300ms redirect · real-time analytics"}</span>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredLinks.map((link) => (
            <LinkCard
              key={link.id}
              id={link.id}
              shortCode={link.shortCode}
              shortUrl={link.shortUrl}
              originalUrl={link.originalUrl}
              totalClicks={link.totalClicks}
              createdAt={link.createdAt}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
