"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface RollingTextProps {
  children: React.ReactNode;
  className?: string;
}

export function RollingText({ children, className }: RollingTextProps) {
  const [hovered, setHovered] = React.useState(false);

  // Touch fallback: only roll on devices that actually support hover, so a
  // first tap on a phone never scrolls the label out of view.
  const supportsHover = React.useMemo(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia?.("(hover: hover)").matches ?? true;
  }, []);

  const enter = React.useCallback(() => {
    if (supportsHover) setHovered(true);
  }, [supportsHover]);
  const leave = React.useCallback(() => setHovered(false), []);

  return (
    <span
      className="pointer-events-auto inline-flex relative overflow-hidden"
      onMouseEnter={enter}
      onMouseLeave={leave}
      onFocus={enter}
      onBlur={leave}
    >
      <span
        className={cn(
          "inline-flex transition-transform duration-fast ease-[cubic-bezier(0.16,1,0.3,1)]",
          hovered && "-translate-y-full",
          className
        )}
      >
        {children}
      </span>
      <span
        aria-hidden
        className={cn(
          "absolute left-0 top-0 inline-flex translate-y-full transition-transform duration-fast ease-[cubic-bezier(0.16,1,0.3,1)]",
          hovered && "translate-y-0",
          className
        )}
      >
        {children}
      </span>
    </span>
  );
}