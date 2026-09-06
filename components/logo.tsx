"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export type LogoConcept = "bracket" | "monogram" | "slash";
export type LogoVariant = "full" | "icon";
export type LogoSize = "xs" | "sm" | "md" | "lg" | "xl";

export interface LogoProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Concept variation:
   * - "bracket": Concept 1 — Terminal Brackets enclosing a live link node [ • ]
   * - "monogram": Concept 2 — Interlocking Chain Link Monogram forming "S" with telemetry dot
   * - "slash": Concept 3 — Instrument Protocol Badge (s/ + signal beacon)
   */
  concept?: LogoConcept;
  /**
   * "full" renders icon + wordmark "shortlytics"
   * "icon" renders icon only (for favicon, mobile header, compact spaces)
   */
  variant?: LogoVariant;
  /**
   * Preset sizes:
   * - "xs": 16px (favicon scale)
   * - "sm": 24px
   * - "md": 32px (default navbar scale)
   * - "lg": 40px
   * - "xl": 48px
   */
  size?: LogoSize;
  /**
   * Whether to animate the electric lime live signal dot with a subtle pulse.
   * Default: true
   */
  animated?: boolean;
  /**
   * Custom class for the wordmark text
   */
  textClassName?: string;
  /**
   * Custom class for the icon SVG
   */
  iconClassName?: string;
  /**
   * Accent color override for the live dot (defaults to electric lime #A3E635)
   */
  accentColor?: string;
}

const SIZE_MAP = {
  xs: { icon: 16, text: "text-xs gap-1.5" },
  sm: { icon: 22, text: "text-sm gap-2" },
  md: { icon: 28, text: "text-base gap-2.5" },
  lg: { icon: 36, text: "text-xl gap-3" },
  xl: { icon: 44, text: "text-2xl gap-3.5" },
};

/**
 * Concept 1: "Signal Bracket" (Terminal Node)
 * Developer terminal bracket [ ] with 2px stroke and moderate 4px radius,
 * framing a live link bridge and electric lime signal dot.
 */
function BracketIcon({
  size,
  animated = true,
  className,
  accentColor = "#A3E635",
}: {
  size: number;
  animated?: boolean;
  className?: string;
  accentColor?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0 select-none", className)}
      aria-hidden="true"
    >
      {/* Left Bracket */}
      <path
        d="M 8 4.5 H 5.5 C 4.12 4.5 3 5.62 3 7 V 17 C 3 18.38 4.12 19.5 5.5 19.5 H 8"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Right Bracket */}
      <path
        d="M 16 4.5 H 18.5 C 19.88 4.5 21 5.62 21 7 V 17 C 21 18.38 19.88 19.5 18.5 19.5 H 16"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Short Link Bridge */}
      <path
        d="M 7.5 15.5 L 13.5 9.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Pulse Beacon Ring */}
      {animated && (
        <circle
          cx="16.5"
          cy="7.5"
          r="4.5"
          stroke={accentColor}
          strokeWidth="1.2"
          className="animate-ping origin-[16.5px_7.5px] opacity-75"
        />
      )}
      {/* Live Signal Node (Electric Lime) */}
      <circle cx="16.5" cy="7.5" r="2.25" fill={accentColor} />
    </svg>
  );
}

/**
 * Concept 2: "Linked Signal S" (Monogram Link) — RECOMMENDED
 * Geometric "S" lettermark constructed from interconnected link chain loops,
 * culminating in an active electric lime live signal dot at the upper-right terminal.
 */
function MonogramIcon({
  size,
  animated = true,
  className,
  accentColor = "#A3E635",
}: {
  size: number;
  animated?: boolean;
  className?: string;
  accentColor?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0 select-none", className)}
      aria-hidden="true"
    >
      {/* Upper Link Hook */}
      <path
        d="M 13.5 4.5 H 8.5 C 6.57 4.5 5 6.07 5 8 C 5 9.93 6.57 11.5 8.5 11.5 H 11.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Diagonal Core Link Connector */}
      <path
        d="M 8.5 15.5 L 15.5 8.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Lower Link Hook */}
      <path
        d="M 12.5 12.5 H 15.5 C 17.43 12.5 19 14.07 19 16 C 19 17.93 17.43 19.5 15.5 19.5 H 8.5 C 6.57 19.5 5 17.93 5 16"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Pulse Beacon Ring */}
      {animated && (
        <circle
          cx="18.5"
          cy="4.5"
          r="4.5"
          stroke={accentColor}
          strokeWidth="1.2"
          className="animate-ping origin-[18.5px_4.5px] opacity-75"
        />
      )}
      {/* Live Signal Node (Electric Lime) */}
      <circle cx="18.5" cy="4.5" r="2.25" fill={accentColor} />
    </svg>
  );
}

/**
 * Concept 3: "Protocol Slash" (Data Instrument Frame)
 * Modular data instrument container (moderate 5px radius) housing the "s/" protocol mark
 * and a live telemetry beacon.
 */
function SlashIcon({
  size,
  animated = true,
  className,
  accentColor = "#A3E635",
}: {
  size: number;
  animated?: boolean;
  className?: string;
  accentColor?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0 select-none", className)}
      aria-hidden="true"
    >
      {/* Bounding Instrument Frame (moderate radius 5px) */}
      <rect
        x="2.5"
        y="2.5"
        width="19"
        height="19"
        rx="5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Monogram Lowercase s */}
      <path
        d="M 9.5 9 H 7.5 C 6.67 9 6 9.67 6 10.5 C 6 11.33 6.67 12 7.5 12 H 9.5 C 10.33 12 11 12.67 11 13.5 C 11 14.33 10.33 15 9.5 15 H 7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Forward Link Slash */}
      <path
        d="M 12.5 16.5 L 15.5 7.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Pulse Beacon Ring */}
      {animated && (
        <circle
          cx="18.5"
          cy="5.5"
          r="4"
          stroke={accentColor}
          strokeWidth="1.2"
          className="animate-ping origin-[18.5px_5.5px] opacity-75"
        />
      )}
      {/* Live Signal Node (Electric Lime) */}
      <circle cx="18.5" cy="5.5" r="2.25" fill={accentColor} />
    </svg>
  );
}

export function LogoIcon({
  concept = "monogram",
  size = "md",
  animated = true,
  className,
  accentColor = "#A3E635",
}: {
  concept?: LogoConcept;
  size?: LogoSize;
  animated?: boolean;
  className?: string;
  accentColor?: string;
}) {
  const pixelSize = SIZE_MAP[size].icon;

  switch (concept) {
    case "bracket":
      return (
        <BracketIcon
          size={pixelSize}
          animated={animated}
          className={className}
          accentColor={accentColor}
        />
      );
    case "slash":
      return (
        <SlashIcon
          size={pixelSize}
          animated={animated}
          className={className}
          accentColor={accentColor}
        />
      );
    case "monogram":
    default:
      return (
        <MonogramIcon
          size={pixelSize}
          animated={animated}
          className={className}
          accentColor={accentColor}
        />
      );
  }
}

export function Logo({
  concept = "monogram",
  variant = "full",
  size = "md",
  animated = true,
  textClassName,
  iconClassName,
  accentColor = "#A3E635",
  className,
  ...props
}: LogoProps) {
  const { text: textConfig } = SIZE_MAP[size];

  if (variant === "icon") {
    return (
      <div className={cn("inline-flex items-center justify-center", className)} {...props}>
        <LogoIcon
          concept={concept}
          size={size}
          animated={animated}
          className={iconClassName}
          accentColor={accentColor}
        />
      </div>
    );
  }

  return (
    <div
      className={cn("inline-flex items-center select-none font-mono tracking-tight", textConfig, className)}
      {...props}
    >
      <LogoIcon
        concept={concept}
        size={size}
        animated={animated}
        className={iconClassName}
        accentColor={accentColor}
      />
      <span className={cn("font-bold tracking-tight text-current transition-colors", textClassName)}>
        shortlytics
      </span>
    </div>
  );
}

export default Logo;
