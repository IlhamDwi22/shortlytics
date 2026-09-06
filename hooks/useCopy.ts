"use client";

import * as React from "react";

/**
 * Clipboard copy hook with a short-lived "copied" flag.
 * Centralizes the copy + 2s reset logic that otherwise is duplicated across
 * the landing page, link card, and link detail page.
 */
export function useCopy(resetMs = 2000) {
  const [copied, setCopied] = React.useState(false);

  const copy = React.useCallback(
    async (text: string) => {
      if (!text) return false;
      try {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), resetMs);
        return true;
      } catch {
        return false;
      }
    },
    [resetMs]
  );

  return { copied, copy };
}
