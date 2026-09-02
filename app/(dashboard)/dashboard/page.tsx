"use client";

import * as React from "react";
import { Search, Link2, Zap } from "lucide-react";
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

  React.useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch("/api/links");
        const data = await res.json();
        if (!cancelled && res.ok) {
          setLinks(data.links || []);
        }
      } catch {
        // silently fail
      }
      if (!cancelled) setIsLoading(false);
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const refetchLinks = React.useCallback(async () => {
    try {
      const res = await fetch("/api/links");
      const data = await res.json();
      if (res.ok) {
        setLinks(data.links || []);
      }
    } catch {
      // silently fail
    }
  }, []);

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
        <h1 className="font-display text-2xl font-bold tracking-tight text-zinc-50 sm:text-3xl">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-zinc-400">
          Manage your short links and track their performance.
        </p>
      </div>

      {/* Create link form */}
      <LinkForm onCreated={refetchLinks} />

      {/* Search + count */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-600" />
          <input
            type="text"
            placeholder="Search links..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={cn(
              MONO,
              "h-9 w-full rounded-md border border-white/10 bg-zinc-900/60 pl-9 pr-3 text-xs text-zinc-300 placeholder:text-zinc-600 focus:border-white/20 focus:outline-none focus:ring-1 focus:ring-white/10"
            )}
          />
        </div>
        <span className={cn(MONO, "text-[11px] text-zinc-600")}>
          {links.length} link{links.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Links list */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="rounded-lg border border-white/10 bg-zinc-900/50 p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1 space-y-2">
                  <Skeleton className="h-4 max-w-[12rem]" />
                  <Skeleton className="h-3 max-w-[16rem]" />
                </div>
                <Skeleton className="h-5 w-16 shrink-0 rounded-md" />
              </div>
              <div className="mt-3 flex items-center justify-between border-t border-white/5 pt-3">
                <Skeleton className="h-3 w-20" />
                <div className="flex gap-1">
                  <Skeleton className="size-6 rounded" />
                  <Skeleton className="size-6 rounded" />
                  <Skeleton className="size-6 rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredLinks.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-white/10 py-12 sm:py-16">
          <div className="flex size-12 items-center justify-center rounded-full bg-white/5">
            <Link2 className="size-6 text-zinc-600" />
          </div>
          <h3 className="mt-4 font-display text-sm font-semibold text-zinc-300">
            {searchQuery ? "No links found" : "No links yet"}
          </h3>
          <p className="mt-1 text-xs text-zinc-500">
            {searchQuery
              ? "Try a different search query."
              : "Shorten your first URL above to get started."}
          </p>
          {!searchQuery && (
            <div className="mt-4 flex items-center gap-1.5 text-[11px] text-zinc-600">
              <Zap className="size-3 text-lime-400/60" />
              <span className={MONO}>{"< 300ms redirect · real-time analytics"}</span>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-3">
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
