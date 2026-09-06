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
      <div className="group rounded-xl border border-border bg-card p-5 transition-[border-color] duration-fast hover:border-lime-400/30">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2.5">
              <Link
                href={`/links/${id}`}
                className={cn(MONO, "truncate text-base font-medium text-lime-300 hover:text-lime-200")}
              >
                {shortUrl.replace(/^https?:\/\//, "")}
              </Link>
              <Link
                href={shortUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground/60 transition-colors hover:text-muted-foreground"
              >
                <ExternalLink className="size-4" />
              </Link>
            </div>
            <p className={cn(MONO, "mt-1.5 truncate text-sm text-muted-foreground")}>
              {originalUrl}
            </p>
          </div>

          <div className="flex items-center gap-1.5">
            <Badge variant={totalClicks > 0 ? "default" : "outline"}>
              {totalClicks} clicks
            </Badge>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-border/30 pt-4">
          <span className={cn(MONO, "text-xs uppercase tracking-wider text-muted-foreground/70")}>
            {createdDate}
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={copyToClipboard}
              className="text-muted-foreground hover:text-lime-300"
            >
              {copied ? (
                <Check className="size-4 text-lime-400" />
              ) : (
                <Copy className="size-4" />
              )}
            </Button>
            <Link
              href={`/links/${id}`}
              className={cn(
                "inline-flex size-8 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              )}
            >
              <ExternalLink className="size-4" />
            </Link>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setShowDeleteDialog(true)}
              className="text-muted-foreground hover:text-red-400"
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        </div>
      </div>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Link</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this link? This action cannot be
              undone and all analytics data will be permanently deleted.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-3 rounded-lg border border-border bg-background/60 p-4">
            <p className={cn(MONO, "truncate text-sm text-muted-foreground")}>{shortUrl}</p>
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
