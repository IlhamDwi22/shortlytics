"use client";

import * as React from "react";
import Link from "next/link";
import { ExternalLink, Copy, Check, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

const MONO = "font-mono tracking-tight";

interface LinkCardProps {
  id: string;
  shortCode: string;
  shortUrl: string;
  originalUrl: string;
  totalClicks: number;
  createdAt: string;
  onDelete?: (id: string) => void;
}

export function LinkCard({
  id,
  shortUrl,
  originalUrl,
  totalClicks,
  createdAt,
  onDelete,
}: LinkCardProps) {
  const [copied, setCopied] = React.useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shortUrl);
      setCopied(true);
      toast.success("Copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy.");
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/links/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        toast.error(data.message || "Failed to delete link.");
        setIsDeleting(false);
        return;
      }
      toast.success("Link deleted.");
      setShowDeleteDialog(false);
      onDelete?.(id);
    } catch {
      toast.error("Network error. Please try again.");
    }
    setIsDeleting(false);
  };

  const createdDate = new Date(createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <>
      <div className="group rounded-lg border border-white/10 bg-zinc-900/50 p-4 transition-colors hover:border-white/20">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <Link
                href={`/links/${id}`}
                className={cn(MONO, "truncate text-sm font-medium text-lime-300 hover:text-lime-200")}
              >
                {shortUrl.replace(/^https?:\/\//, "")}
              </Link>
              <Link
                href={shortUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-zinc-600 transition-colors hover:text-zinc-400"
              >
                <ExternalLink className="size-3.5" />
              </Link>
            </div>
            <p className={cn(MONO, "mt-1 truncate text-xs text-zinc-500")}>
              {originalUrl}
            </p>
          </div>

          <div className="flex items-center gap-1.5">
            <Badge variant={totalClicks > 0 ? "default" : "outline"}>
              {totalClicks} clicks
            </Badge>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between border-t border-white/5 pt-3">
          <span className={cn(MONO, "text-[10px] uppercase tracking-wider text-zinc-600")}>
            {createdDate}
          </span>
          <div className="flex items-center gap-0.5">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={copyToClipboard}
              className="text-zinc-500 hover:text-lime-300"
            >
              {copied ? (
                <Check className="size-3.5 text-lime-400" />
              ) : (
                <Copy className="size-3.5" />
              )}
            </Button>
            <Link
              href={`/links/${id}`}
              className={cn(
                "inline-flex size-7 items-center justify-center rounded text-zinc-500 transition-colors hover:bg-white/5 hover:text-zinc-300"
              )}
            >
              <ExternalLink className="size-3.5" />
            </Link>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setShowDeleteDialog(true)}
              className="text-zinc-500 hover:text-red-400"
            >
              <Trash2 className="size-3.5" />
            </Button>
          </div>
        </div>
      </div>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Link</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this link? This action cannot be undone and all analytics data will be permanently removed.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-3 rounded-md border border-white/10 bg-zinc-950/60 p-3">
            <p className={cn(MONO, "truncate text-xs text-zinc-400")}>{shortUrl}</p>
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setShowDeleteDialog(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
