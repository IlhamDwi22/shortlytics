"use client";

import * as React from "react";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

const outgoingVariants = {
  rest: { transform: "translateY(0%)" },
  active: { transform: "translateY(100%)" },
};

const incomingVariants = {
  rest: { transform: "translateY(-100%)" },
  active: { transform: "translateY(0%)" },
};

interface RollingTextProps {
  children: React.ReactNode;
  className?: string;
  duration?: number;
}

export function RollingText({
  children,
  className,
  duration = 0.3,
}: RollingTextProps) {
  const reduceMotion = useReducedMotion();
  const [active, setActive] = React.useState(false);
  const activeRef = React.useRef(false);
  const animating = React.useRef(false);
  const pendingRequest = React.useRef<boolean | null>(null);
  const hovered = React.useRef(false);
  const focused = React.useRef(false);
  const containerRef = React.useRef<HTMLSpanElement>(null);

  const transition = React.useMemo(
    () => ({
      duration,
      ease: [0.338, 0.015, 0.395, 0.959] as const,
    }),
    [duration],
  );

  const updateActive = React.useCallback((next: boolean) => {
    activeRef.current = next;
    setActive(next);
  }, []);

  const requestActive = React.useCallback(
    (next: boolean) => {
      if (reduceMotion) return;

      if (
        typeof window !== "undefined" &&
        window.matchMedia?.("(hover: hover)").matches === false
      ) {
        return;
      }

      if (next === activeRef.current) {
        pendingRequest.current = null;
        return;
      }

      if (animating.current) {
        pendingRequest.current = next;
        return;
      }

      animating.current = true;
      updateActive(next);
    },
    [reduceMotion, updateActive],
  );

  const completeAnimation = React.useCallback(() => {
    if (!animating.current) return;
    animating.current = false;

    if (
      pendingRequest.current !== null &&
      pendingRequest.current !== activeRef.current
    ) {
      const next = pendingRequest.current;
      pendingRequest.current = null;
      animating.current = true;
      updateActive(next);
    } else {
      pendingRequest.current = null;
    }
  }, [updateActive]);

  React.useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    // Attach to the containing button or anchor if present, otherwise to the span itself
    const target = (el.closest("button, a") as HTMLElement | null) || el;

    const handleMouseEnter = () => {
      hovered.current = true;
      requestActive(true);
    };

    const handleMouseLeave = () => {
      hovered.current = false;
      requestActive(focused.current);
    };

    const handleFocus = () => {
      focused.current = true;
      requestActive(true);
    };

    const handleBlur = () => {
      focused.current = false;
      requestActive(hovered.current);
    };

    target.addEventListener("mouseenter", handleMouseEnter);
    target.addEventListener("mouseleave", handleMouseLeave);
    target.addEventListener("focusin", handleFocus);
    target.addEventListener("focusout", handleBlur);

    return () => {
      target.removeEventListener("mouseenter", handleMouseEnter);
      target.removeEventListener("mouseleave", handleMouseLeave);
      target.removeEventListener("focusin", handleFocus);
      target.removeEventListener("focusout", handleBlur);
    };
  }, [requestActive]);

  return (
    <span
      ref={containerRef}
      className={cn(
        "relative inline-flex overflow-hidden align-middle select-none",
        className,
      )}
    >
      <motion.span
        className="inline-flex items-center whitespace-nowrap pointer-events-none"
        variants={outgoingVariants}
        initial="rest"
        animate={active ? "active" : "rest"}
        onAnimationComplete={completeAnimation}
        transition={transition}
      >
        {children}
      </motion.span>
      <motion.span
        aria-hidden="true"
        className="absolute inset-0 inline-flex items-center whitespace-nowrap pointer-events-none"
        variants={incomingVariants}
        initial="rest"
        animate={active ? "active" : "rest"}
        transition={transition}
      >
        {children}
      </motion.span>
    </span>
  );
}