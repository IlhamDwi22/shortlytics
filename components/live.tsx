"use client";

import * as React from "react";
import {
  animate,
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "motion/react";
import { cn } from "@/lib/utils";

/* ────────────────────────────────────────────────────────────────────────
   Data-instrument motion primitives — see docs/design-Shortlytics.md §7.2
   ──────────────────────────────────────────────────────────────────────── */

/** Scroll reveal: fade + small translate, optional stagger delay. */
export function Reveal({
  children,
  className,
  delay = 0,
  y = 12,
  duration = 0.5,
  id,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  duration?: number;
  id?: string;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      id={id}
      initial={reduce ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/** Count-up that runs when scrolled into view, then rolls on every change. */
export function CountUp({
  to,
  prefix = "",
  suffix = "",
  duration = 0.4,
  className,
}: {
  to: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const ref = React.useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });
  const mv = useMotionValue(0);
  const rounded = useTransform(mv, (v) => Math.round(v).toLocaleString());

  React.useEffect(() => {
    if (!inView) return;
    if (reduce) {
      mv.set(to);
      return;
    }
    const controls = animate(mv, to, {
      duration: 0.9,
      ease: [0.16, 1, 0.3, 1],
    });
    return () => controls.stop();
  }, [inView, reduce, to, mv]);

  React.useEffect(() => {
    if (!reduce) {
      const controls = animate(mv, to, { duration, ease: [0.16, 1, 0.3, 1] });
      return () => controls.stop();
    }
    mv.set(to);
  }, [to, reduce, mv, duration]);

  return (
    <span ref={ref} className={cn("tabular-nums", className)}>
      {prefix}
      <motion.span>{rounded}</motion.span>
      {suffix}
    </span>
  );
}

/** Radiating "LIVE" ping dot — 2s loop, linear easing. */
export function LiveDot({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn("relative inline-flex size-1.5", className)}
    >
      <span className="ping-radial absolute inset-0 rounded-full bg-lime-400" />
      <span className="size-1.5 rounded-full bg-lime-400" />
    </span>
  );
}

/**
 * Text-writing (typewriter) reveal: types `text` char-by-char when the element
 * scrolls into view, then keeps a blinking caret. Newlines become <br/>. Any
 * substring equal to `highlight` is rendered in lime (the instrument accent).
 *
 * Layout-stable: full text is always rendered (invisible) to measure height,
 * so surrounding content never shifts during the animation.
 */
export function Typewriter({
  text,
  highlight,
  speed = 38,
  startDelay = 200,
  className,
}: {
  text: string;
  highlight?: string;
  speed?: number;
  startDelay?: number;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const ref = React.useRef<HTMLSpanElement>(null);
  const rafRef = React.useRef<number | null>(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });
  const hlStart = highlight ? text.indexOf(highlight) : -1;
  const hlEnd = highlight ? hlStart + highlight.length : hlStart;

  const [count, setCount] = React.useState(() => (reduce ? text.length : 0));

  React.useEffect(() => {
    if (!inView || reduce) return;
    let i = 0;
    let last = 0;

    const tick = (now: number) => {
      if (now - last >= speed) {
        i += 1;
        setCount(i);
        last = now;
        if (i >= text.length) return;
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    const timer = window.setTimeout(() => {
      last = performance.now();
      rafRef.current = requestAnimationFrame(tick);
    }, startDelay);

    return () => {
      window.clearTimeout(timer);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [inView, reduce, text, speed, startDelay]);

  const done = count >= text.length;

  const renderText = (chars: string[]) =>
    chars.map((ch, i) => {
      const inHl = hlStart >= 0 && i >= hlStart && i < hlEnd;
      if (ch === "\n") {
        return (
          <React.Fragment key={i}>
            {"\n"}
            <br />
          </React.Fragment>
        );
      }
      return (
        <span key={i} className={cn(inHl && "text-lime-300 text-glow-lime")}>
          {ch}
        </span>
      );
    });

  const caret = (
    <span
      aria-hidden
      className="caret-blink ml-0.5 inline-block h-[0.9em] w-[2px] translate-y-[0.12em] bg-lime-400"
    />
  );

  const allChars = text.split("");

  return (
    <span ref={ref} className={cn("grid w-full", className)}>
      {/* invisible placeholder — always renders full text to hold height */}
      <span className="invisible col-start-1 row-start-1 select-none" aria-hidden>
        {renderText(allChars)}
      </span>
      {/* visible typewriter — overlaid on the same grid cell */}
      <span className="col-start-1 row-start-1">
        {reduce
          ? renderText(allChars)
          : renderText(allChars.slice(0, count))}
        {!done && !reduce && caret}
      </span>
    </span>
  );
}
