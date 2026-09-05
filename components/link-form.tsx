"use client";

import * as React from "react";
import { ArrowUpRight, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RollingText } from "@/components/rolling-text";
import { cn } from "@/lib/utils";

const MONO = "font-mono tracking-tight";

interface LinkFormProps {
  onCreated?: () => void;
}

export function LinkForm({ onCreated }: LinkFormProps) {
  const [url, setUrl] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    if (!url.trim()) {
      setError("Masukkan URL terlebih dahulu.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ originalUrl: url.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Gagal membuat short link.");
        toast.error(data.message || "Failed to create short link.");
        setIsLoading(false);
        return;
      }

      toast.success("Short link created!", {
        description: data.shortUrl,
        action: {
          label: "Copy",
          onClick: () => {
            navigator.clipboard.writeText(data.shortUrl);
            toast.success("Copied to clipboard!");
          },
        },
      });

      setUrl("");
      setIsLoading(false);
      onCreated?.();
    } catch {
      setError("Gagal terhubung ke server. Coba lagi.");
      toast.error("Network error. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-border bg-card p-2">
      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="flex flex-1 items-center gap-2.5 px-4">
          <span className={cn(MONO, "flex items-center gap-1 text-sm text-muted-foreground")}>
            <span className="text-lime-300">$</span>
          </span>
          <Input
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              if (error) setError(null);
            }}
            placeholder="paste://your-long-url-here"
            aria-label="Paste your long URL"
            aria-invalid={!!error}
            aria-describedby={error ? "link-url-error" : undefined}
            disabled={isLoading}
            className={cn(
              "h-12 border-0 bg-transparent p-0 font-mono text-base text-foreground shadow-none focus-visible:ring-2 focus-visible:ring-lime-400/30",
              error && "focus-visible:ring-red-400/40"
            )}
          />
          {error && (
            <p
              id="link-url-error"
              role="alert"
              className="mb-1 text-xs text-red-400"
            >
              {error}
            </p>
          )}
        </div>
        <Button
          type="submit"
          size="lg"
          disabled={isLoading}
          className="h-12 rounded-lg bg-lime-400 px-6 font-medium text-zinc-950 hover:bg-lime-300 active:scale-[0.98]"
        >
          {isLoading ? (
            <Loader2 className="mr-1.5 size-5 animate-spin" />
          ) : (
            <ArrowUpRight className="mr-1.5 size-4.5" />
          )}
          {isLoading ? "Shortening..." : <RollingText>Shorten</RollingText>}
        </Button>
      </div>
    </form>
  );
}
