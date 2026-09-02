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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    if (!url.trim()) {
      toast.error("Please enter a URL to shorten.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ originalUrl: url.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
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
      toast.error("Network error. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-lg border border-border bg-card p-1.5">
      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="flex flex-1 items-center gap-2 px-3">
          <span className={cn(MONO, "flex items-center gap-1 text-xs text-muted-foreground")}>
            <span className="text-lime-300">$</span>
          </span>
          <Input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="paste://your-long-url-here"
            aria-label="Paste your long URL"
            disabled={isLoading}
            className="h-11 border-0 bg-transparent p-0 font-mono text-sm text-foreground shadow-none placeholder:text-muted-foreground/60 focus-visible:ring-0"
          />
        </div>
        <Button
          type="submit"
          size="lg"
          disabled={isLoading}
          className="h-11 rounded-md bg-lime-400 px-5 font-medium text-zinc-950 hover:bg-lime-300 active:scale-[0.98]"
        >
          {isLoading ? (
            <Loader2 className="mr-1.5 size-4 animate-spin" />
          ) : (
            <ArrowUpRight className="mr-1.5 size-4" />
          )}
          {isLoading ? "Shortening..." : <RollingText>Shorten</RollingText>}
        </Button>
      </div>
    </form>
  );
}
