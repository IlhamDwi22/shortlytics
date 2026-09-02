"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface RollingTextProps {
  children: React.ReactNode;
  className?: string;
}

export function RollingText({ children, className }: RollingTextProps) {
  const [hovered, setHovered] = React.useState(false);

  return (
    <span
      className="pointer-events-auto inline-flex overflow-hidden relative"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <span
        className={cn(
          "inline-flex transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
          hovered && "-translate-y-full",
          className
        )}
      >
        {children}
      </span>
      <span
        aria-hidden
        className={cn(
          "absolute left-0 top-0 inline-flex translate-y-full transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
          hovered && "translate-y-0",
          className
        )}
      >
        {children}
      </span>
    </span>
  );
}
