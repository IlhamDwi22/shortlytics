"use client";

import * as React from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { motion, useReducedMotion } from "motion/react";
import {
  ArrowUpRight,
  Copy,
  Check,
  Radio,
  Activity,
  Globe2,
  Smartphone,
  Laptop,
  Tablet,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RollingText } from "@/components/rolling-text";
import { CountUp, LiveDot, Reveal } from "@/components/live";
import Aurora from "@/components/aurora";
import { Logo, LogoIcon } from "@/components/logo";
import { FaqAccordion } from "@/components/faq-accordion";
import { useCopy } from "@/hooks/useCopy";
import { cn } from "@/lib/utils";

const MONO = "font-mono tracking-tight";

// Public app domain for the landing demo console (inlined at build time).
const APP_DOMAIN = process.env.NEXT_PUBLIC_APP_DOMAIN || "shortlytics.app";

/* ── live data model ──────────────────────────────────────────────────── */
const REFERRERS = [
  { label: "instagram.com", pct: 46, live: true },
  { label: "direct", pct: 31, live: false },
  { label: "x.com", pct: 15, live: true },
  { label: "whatsapp.com", pct: 8, live: false },
];

const DEVICES = [
  { label: "Mobile", pct: 62, icon: Smartphone },
  { label: "Desktop", pct: 33, icon: Laptop },
  { label: "Tablet", pct: 5, icon: Tablet },
];

function useTickingCounter(
  initial: number,
  stepMin = 0,
  stepMax = 3,
  intervalMs = 2800,
) {
  const [value, setValue] = React.useState(initial);
  React.useEffect(() => {
    const id = setInterval(() => {
      if (typeof document !== "undefined" && document.hidden) return;
      setValue((v) => {
        const delta =
          Math.floor(Math.random() * (stepMax - stepMin + 1)) + stepMin;
        return v + delta;
      });
    }, intervalMs);
    return () => clearInterval(id);
  }, [stepMax, stepMin, intervalMs]);
  return value;
}

export default function LandingPage() {
  const { data: session } = useSession();
  const reduce = useReducedMotion();
  const totalClicks = useTickingCounter(148);
  const clicksToday = useTickingCounter(63, 0, 2);

  const [url, setUrl] = React.useState("");
  const [state, setState] = React.useState<
    "idle" | "loading" | "done" | "error"
  >("idle");
  const [shortUrl, setShortUrl] = React.useState("");
  const [isScrolled, setIsScrolled] = React.useState(false);
  const { copied, copy: copyClipboard } = useCopy();

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (state === "loading") return;
    if (!url.trim()) {
      setState("error");
      return;
    }
    setState("loading");
    setTimeout(() => {
      setShortUrl(`https://${APP_DOMAIN}/aZ3kP9`);
      setState("done");
    }, 650);
  };

  const copy = async () => {
    // Clipboard may be unavailable; silently ignore for the demo console.
    await copyClipboard(shortUrl);
  };

  return (
    /* Landing is deliberately pinned to the dark "data instrument" shell,
       independent of the app-level theme (dashboard/auth honor system pref). */
    <div className="dark flex min-h-screen flex-col bg-background text-foreground selection:bg-lime-400/30 selection:text-lime-200">
      {/* 1 · Nav — Floating Pill Navbar */}
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 pointer-events-none transition-all duration-300 ease-out",
          isScrolled ? "pt-3 sm:pt-4" : "pt-0",
        )}
      >
        <div
          className={cn(
            "mx-auto w-full transition-all duration-300 ease-out",
            isScrolled
              ? "max-w-7xl px-4 sm:px-6 lg:px-8"
              : "max-w-[96rem] px-4 sm:px-8 lg:px-12",
          )}
        >
          <div
            className={cn(
              "pointer-events-auto flex w-full items-center justify-between transition-all duration-300 ease-out",
              isScrolled
                ? "h-14 sm:h-16 px-4 sm:px-7 rounded-xl sm:rounded-2xl bg-zinc-950/85 backdrop-blur-md border border-white/10 shadow-xl shadow-black/50"
                : "h-16 sm:h-20 px-0 bg-transparent border-transparent shadow-none rounded-none",
            )}
          >
            <Link
              href="/"
              className={cn(
                "group flex items-center transition-colors duration-300",
                isScrolled ? "text-foreground" : "text-zinc-950",
              )}
            >
              <Logo
                size="md"
                animated={true}
                textClassName={isScrolled ? "text-foreground" : "text-zinc-950"}
              />
            </Link>

            <nav className="hidden items-center gap-8 md:flex">
              {[
                ["Analytics", "#analytics"],
                ["Features", "#features"],
                ["How it works", "#how-it-works"],
                ["FAQ", "#faq"],
              ].map(([label, href]) => (
                <a
                  key={href}
                  href={href}
                  className={cn(
                    MONO,
                    "group relative py-1 text-xs uppercase tracking-[0.16em] font-semibold transition-colors duration-300",
                    isScrolled
                      ? "text-zinc-400 hover:text-lime-300"
                      : "text-zinc-950/80 hover:text-zinc-950",
                  )}
                >
                  {label}
                  <span
                    aria-hidden="true"
                    className={cn(
                      "absolute -bottom-0.5 left-0 right-0 h-[2px] rounded-full bg-lime-400 shadow-[0_0_8px_rgba(163,230,53,0.6)]",
                      "scale-x-0 origin-left transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-x-100",
                    )}
                  />
                </a>
              ))}
            </nav>

            <div className="flex items-center gap-2.5">
              {session?.user ? (
                <Link
                  href="/dashboard"
                  className={cn(
                    buttonVariants({ size: isScrolled ? "sm" : "default" }),
                    "rounded-xl font-semibold transition-all duration-300 shadow-sm",
                    isScrolled
                      ? "bg-lime-400 text-zinc-950 hover:bg-lime-300"
                      : "bg-zinc-950 text-lime-300 hover:bg-zinc-900 border border-zinc-950/30",
                  )}
                >
                  <RollingText>Dashboard</RollingText>
                  <ArrowUpRight className="ml-1 size-4" />
                </Link>
              ) : (
                <>
                  <Link
                    href="/login"
                    className={cn(
                      buttonVariants({
                        size: isScrolled ? "sm" : "default",
                        variant: "ghost",
                      }),
                      "hidden rounded-xl font-semibold transition-colors duration-300 sm:inline-flex",
                      isScrolled
                        ? "text-muted-foreground hover:bg-muted hover:text-foreground"
                        : "text-zinc-950/80 hover:bg-zinc-950/10 hover:text-zinc-950",
                    )}
                  >
                    Log in
                  </Link>
                  <Link
                    href="/register"
                    className={cn(
                      buttonVariants({ size: isScrolled ? "sm" : "default" }),
                      "rounded-xl font-semibold transition-all duration-300 shadow-sm",
                      isScrolled
                        ? "bg-lime-400 text-zinc-950 hover:bg-lime-300"
                        : "bg-zinc-950 text-lime-300 hover:bg-zinc-900 border border-zinc-950/30",
                    )}
                  >
                    <RollingText>Get started</RollingText>
                    <ArrowUpRight className="ml-1 size-4" />
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* 2 · Hero — asymmetric: working shorten console left, live instrument right */}
      <section className="relative overflow-hidden isolate">
        {/* Aurora Background Effect */}
        <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
          <Aurora
            colorStops={["#7cff67", "#B497CF", "#5227FF"]}
            blend={0.5}
            amplitude={1.0}
            speed={0.6}
          />
          {/* Subtle top ambient lime glow for brand harmony */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(163,230,53,0.14),transparent_65%)]"
          />
          {/* Smooth bottom fade into next section */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-background via-background/40 to-transparent"
          />
        </div>

        <div
          className="relative z-10 mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-14 px-4 pb-20 pt-24 sm:pt-28 lg:pt-32 sm:px-6 lg:grid-cols-12 lg:gap-10 lg:px-8"
          style={{ minHeight: "100dvh" }}
        >
          {/* Left — shorten console */}
          <Reveal className="flex flex-col justify-center lg:col-span-6">
            <div
              className={cn(
                MONO,
                "inline-flex w-fit items-center gap-2 rounded border border-border bg-muted/50 px-3 py-1.5 text-xs uppercase tracking-[0.14em] text-lime-300",
              )}
            >
              <Radio className="size-3.5 animate-pulse" />
              Live SSE stream · 0.0s refresh
            </div>

            <h1 className="mt-7 grid w-full max-w-2xl font-display text-5xl font-bold leading-[1.15] tracking-tight text-foreground sm:text-6xl lg:text-[3.75rem]">
              {/* invisible placeholder — holds final height */}
              <span
                className="invisible col-start-1 row-start-1 select-none"
                aria-hidden
              >
                Short links.
                <br />
                Signals in real time.
              </span>
              {/* visible animated text */}
              <motion.span
                className="col-start-1 row-start-1"
                initial={reduce ? false : "hidden"}
                animate="visible"
                variants={{
                  hidden: {},
                  visible: { transition: { staggerChildren: 0.07 } },
                }}
              >
                <motion.span
                  className="inline-block"
                  variants={{
                    hidden: { opacity: 0, y: 12 },
                    visible: {
                      opacity: 1,
                      y: 0,
                      transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] },
                    },
                  }}
                >
                  Short
                </motion.span>
                <span className="inline-block">&nbsp;</span>
                <motion.span
                  className="inline-block"
                  variants={{
                    hidden: { opacity: 0, y: 12 },
                    visible: {
                      opacity: 1,
                      y: 0,
                      transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] },
                    },
                  }}
                >
                  links.
                </motion.span>
                <br />
                <motion.span
                  className="mt-1 inline-block"
                  variants={{
                    hidden: { opacity: 0, y: 12 },
                    visible: {
                      opacity: 1,
                      y: 0,
                      transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] },
                    },
                  }}
                >
                  Signals
                </motion.span>
                <span className="inline-block">&nbsp;</span>
                <motion.span
                  className="inline-block"
                  variants={{
                    hidden: { opacity: 0, y: 12 },
                    visible: {
                      opacity: 1,
                      y: 0,
                      transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] },
                    },
                  }}
                >
                  in
                </motion.span>
                <span className="inline-block">&nbsp;</span>
                <motion.span
                  className="mt-1 inline-block text-lime-300 text-glow-lime"
                  variants={{
                    hidden: { opacity: 0, y: 12 },
                    visible: {
                      opacity: 1,
                      y: 0,
                      transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] },
                    },
                  }}
                >
                  real
                </motion.span>
                <span className="inline-block">&nbsp;</span>
                <motion.span
                  className="mt-1 inline-block text-lime-300 text-glow-lime"
                  variants={{
                    hidden: { opacity: 0, y: 12 },
                    visible: {
                      opacity: 1,
                      y: 0,
                      transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] },
                    },
                  }}
                >
                  time.
                </motion.span>
              </motion.span>
            </h1>

            <p className="mt-4 max-w-lg text-lg leading-relaxed text-muted-foreground">
              A developer-grade URL shortener with live analytics. Watch clicks,
              devices, and referrers arrive the second they happen — free,
              transparent, no paywall.
            </p>

            {/* Working shorten console */}
            <form
              onSubmit={submit}
              className="mt-10 rounded-xl border border-border bg-card p-2 focus-within:border-lime-400/50"
            >
              <div className="flex flex-col gap-2 sm:flex-row">
                <div className="flex flex-1 items-center gap-2.5 px-4">
                  <span
                    className={cn(
                      MONO,
                      "flex items-center gap-1 text-sm text-muted-foreground",
                    )}
                  >
                    <span className="text-lime-300">$</span>
                  </span>
                  <Input
                    value={url}
                    onChange={(e) => {
                      setUrl(e.target.value);
                      if (state === "error") setState("idle");
                    }}
                    placeholder="paste://your-long-url-here"
                    aria-label="Paste your long URL"
                    className="h-12 border-0 bg-transparent p-0 font-mono text-base text-foreground shadow-none placeholder:text-muted-foreground/60 focus-visible:ring-0"
                  />
                </div>
                <Button
                  type="submit"
                  size="lg"
                  disabled={state === "loading"}
                  className="h-12 rounded-lg bg-lime-400 px-6 font-medium text-zinc-950 hover:bg-lime-300 active:scale-[0.98]"
                >
                  {state === "loading" ? (
                    "Hashing…"
                  ) : (
                    <RollingText>Shorten</RollingText>
                  )}
                  <ArrowUpRight className="ml-1.5 size-4.5" />
                </Button>
              </div>

              <div className="mt-1.5 min-h-[48px] border-t border-border/30 px-4 pt-2.5">
                {state === "idle" && (
                  <p className={cn(MONO, "text-xs text-muted-foreground/70")}>
                    {"// 7-char base62 · CSPRNG · anti-loop guarded"}
                  </p>
                )}
                {state === "error" && (
                  <p className={cn(MONO, "text-xs text-red-400")}>
                    Invalid URL — must start with http:// or https://
                  </p>
                )}
                {state === "done" && (
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={cn(MONO, "truncate text-sm text-lime-300")}
                    >
                      {shortUrl}
                    </span>
                    <Button
                      type="button"
                      onClick={copy}
                      size="sm"
                      variant="ghost"
                      className="rounded text-xs uppercase tracking-wide text-muted-foreground hover:bg-muted hover:text-lime-300"
                    >
                      {copied ? (
                        <Check className="mr-1 size-4 text-lime-400" />
                      ) : (
                        <Copy className="mr-1 size-4" />
                      )}
                      {copied ? "Copied" : "Copy"}
                    </Button>
                  </div>
                )}
                {state === "loading" && (
                  <div className="flex items-center gap-2.5">
                    <span className="size-4 animate-spin rounded-full border-2 border-muted-foreground/40 border-t-lime-400" />
                    <span className={cn(MONO, "text-sm text-muted-foreground")}>
                      generating unique code…
                    </span>
                  </div>
                )}
              </div>
            </form>

            {/* trust rail */}
            <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-border pt-6">
              {[
                ["<300ms", "redirect"],
                ["open", "source"],
                ["no", "paywall"],
              ].map(([n, l]) => (
                <span
                  key={l}
                  className={cn(MONO, "text-sm text-muted-foreground")}
                >
                  <span className="font-semibold text-foreground">{n}</span> {l}
                </span>
              ))}
            </div>
          </Reveal>

          {/* Right — live instrument panel */}
          <Reveal delay={0.08} y={16} id="analytics" className="lg:col-span-6">
            <figure className="relative rounded-xl border border-border bg-card">
              {/* panel header */}
              <figcaption className="flex items-center justify-between gap-2.5 border-b border-border px-3.5 py-2.5 sm:px-5 sm:py-3">
                <div className="flex min-w-0 items-center gap-1.5 sm:gap-2">
                  <div className="flex shrink-0 items-center gap-1 sm:gap-1.5">
                    <span className="size-2 rounded-full bg-muted-foreground/40 sm:size-2.5" />
                    <span className="size-2 rounded-full bg-muted-foreground/40 sm:size-2.5" />
                    <span className="size-2 rounded-full bg-muted-foreground/40 sm:size-2.5" />
                  </div>
                  <span
                    className={cn(MONO, "truncate text-xs text-muted-foreground")}
                    title={`${APP_DOMAIN}/analytics`}
                  >
                    {APP_DOMAIN}/analytics
                  </span>
                </div>
                <span
                  className={cn(
                    MONO,
                    "inline-flex shrink-0 items-center gap-1.5 rounded border border-lime-400/30 bg-lime-400/10 px-2 py-0.5 text-[11px] uppercase tracking-wide text-lime-300 sm:px-2.5 sm:py-1",
                  )}
                >
                  <LiveDot />
                  live
                </span>
              </figcaption>

              {/* live counters */}
              <div className="grid grid-cols-2 divide-x divide-border/30">
                <div className="p-4 sm:p-5">
                  <span
                    className={cn(
                      MONO,
                      "text-[11px] uppercase tracking-[0.14em] text-muted-foreground sm:text-xs",
                    )}
                  >
                    total clicks
                  </span>
                  <div
                    className={cn(
                      MONO,
                      "mt-1.5 text-3xl font-semibold text-foreground tabular-nums sm:text-5xl",
                    )}
                  >
                    <CountUp to={totalClicks} />
                  </div>
                </div>
                <div className="p-4 sm:p-5">
                  <span
                    className={cn(
                      MONO,
                      "text-[11px] uppercase tracking-[0.14em] text-muted-foreground sm:text-xs",
                    )}
                  >
                    today
                  </span>
                  <div
                    className={cn(
                      MONO,
                      "mt-1.5 text-3xl font-semibold text-lime-300 tabular-nums sm:text-5xl",
                    )}
                  >
                    <CountUp to={clicksToday} prefix="+" />
                  </div>
                </div>
              </div>

              {/* referrer feed */}
              <div className="border-t border-border px-4 py-3.5 sm:px-5 sm:py-4">
                <span
                  className={cn(
                    MONO,
                    "text-[11px] uppercase tracking-[0.14em] text-zinc-500 sm:text-xs",
                  )}
                >
                  top referrers
                </span>
                <ul className="mt-3 space-y-2.5">
                  {REFERRERS.map((r) => (
                    <li key={r.label} className="flex items-center gap-2.5 sm:gap-3">
                      <span
                        className={cn(
                          MONO,
                          "w-24 shrink-0 truncate text-xs text-foreground/70 sm:w-32 sm:text-sm",
                        )}
                      >
                        {r.label}
                      </span>
                      <div className="h-1.5 sm:h-2 flex-1 overflow-hidden rounded-full bg-muted/50">
                        <motion.div
                          className="h-full rounded-full bg-muted-foreground/50"
                          initial={{ width: 0 }}
                          whileInView={{ width: `${r.pct}%` }}
                          viewport={{ once: true }}
                          transition={{
                            duration: 0.35,
                            ease: [0.16, 1, 0.3, 1],
                          }}
                        />
                      </div>
                      <span
                        className={cn(
                          MONO,
                          "w-9 sm:w-10 text-right text-xs sm:text-sm tabular-nums text-muted-foreground",
                        )}
                      >
                        {r.pct}%
                      </span>
                      {r.live && <LiveDot className="h-2 w-2 sm:h-2.5 sm:w-2.5" />}
                    </li>
                  ))}
                </ul>
              </div>

              {/* device bars */}
              <div className="grid grid-cols-3 gap-px border-t border-border bg-muted/30">
                {DEVICES.map((d) => (
                  <div key={d.label} className="bg-card px-3 py-3 sm:px-5 sm:py-4">
                    <div className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs text-muted-foreground">
                      <d.icon className="size-3.5 sm:size-4 text-lime-300 shrink-0" />
                      <span className="truncate">{d.label}</span>
                    </div>
                    <div
                      className={cn(
                        MONO,
                        "mt-1 text-lg sm:text-xl font-semibold text-foreground tabular-nums",
                      )}
                    >
                      {d.pct}%
                    </div>
                  </div>
                ))}
              </div>
            </figure>
          </Reveal>
        </div>
      </section>

      {/* 3 · Data rail */}
      <section className="border-y border-border">
        <Reveal>
          <div className="mx-auto grid max-w-7xl grid-cols-2 gap-px bg-muted/30 px-4 sm:px-6 md:grid-cols-4 lg:px-8">
            {[
              ["62⁷", "unique code space"],
              ["<300ms", "redirect latency"],
              ["7-char", "base62 short codes"],
              ["0", "paywalls, ever"],
            ].map(([n, l]) => (
              <div key={l} className="bg-background px-4 py-8 text-center">
                <div className={cn(MONO, "text-3xl font-bold text-lime-300")}>
                  {n}
                </div>
                <div
                  className={cn(
                    MONO,
                    "mt-1.5 text-xs uppercase tracking-[0.14em] text-muted-foreground",
                  )}
                >
                  {l}
                </div>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      {/* 4 · Features — bento, mixed cell sizes */}
      <section
        id="features"
        className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8"
      >
        <Reveal className="max-w-2xl">
          <span
            className={cn(
              MONO,
              "text-xs uppercase tracking-[0.16em] text-lime-300",
            )}
          >
            Signals, not vanity metrics
          </span>
          <h2 className="mt-3 font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Built around the click.
          </h2>
        </Reveal>

        <div className="mt-14 grid grid-cols-1 gap-5 md:grid-cols-6">
          {/* large live cell */}
          <Reveal className="md:col-span-4">
            <div className="flex h-full flex-col justify-between rounded-xl border border-border bg-card p-7 transition-colors hover:border-lime-400/30">
              <div className="flex items-center gap-2.5">
                <Activity className="size-5 text-lime-300" />
                <h3
                  className={cn(
                    MONO,
                    "text-sm uppercase tracking-wide text-foreground/80",
                  )}
                >
                  Real-time without the work
                </h3>
              </div>
              <div>
                <p className="mt-4 max-w-sm text-base leading-relaxed text-muted-foreground">
                  Every click lands in your dashboard instantly via Server-Sent
                  Events. No refresh, no polling, no Websocket plumbing to
                  babysit.
                </p>
                <div
                  className={cn(
                    MONO,
                    "mt-7 flex items-center gap-2.5 text-sm text-muted-foreground",
                  )}
                >
                  <span className="text-lime-300">$</span>
                  <code className="rounded bg-muted/50 px-2.5 py-1 text-foreground/70">
                    eventSource.onmessage
                  </code>
                  <span>→ re-render</span>
                </div>
              </div>
            </div>
          </Reveal>

          {/* geography cell */}
          <Reveal delay={0.06} className="md:col-span-2">
            <div className="flex h-full flex-col justify-between rounded-xl border border-border bg-card p-7 transition-colors hover:border-lime-400/30">
              <Globe2 className="size-6 text-lime-300" />
              <div className="mt-7">
                <h3 className="font-display text-xl font-semibold text-foreground">
                  Where it&apos;s read
                </h3>
                <p className="mt-2 text-base text-muted-foreground">
                  Country, city, and device breakdown per link — masked IPs,
                  clean privacy.
                </p>
              </div>
            </div>
          </Reveal>

          {/* instant cell */}
          <Reveal className="md:col-span-2">
            <div className="flex h-full flex-col justify-between rounded-xl border border-border bg-card p-7 transition-colors hover:border-lime-400/30">
              <Zap className="size-6 text-lime-300" />
              <div className="mt-7">
                <h3 className="font-display text-xl font-semibold text-foreground">
                  Instant redirect
                </h3>
                <p className="mt-2 text-base text-muted-foreground">
                  Straight 302 to your target. No interstitial, no ad wall.
                </p>
              </div>
            </div>
          </Reveal>

          {/* security cell */}
          <Reveal delay={0.06} className="md:col-span-4">
            <div className="rounded-xl border border-border bg-card p-7 transition-colors hover:border-lime-400/30">
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="flex gap-3.5">
                  <ShieldCheck className="mt-0.5 size-5 shrink-0 text-lime-300" />
                  <div>
                    <h3 className="font-display text-lg font-semibold text-foreground">
                      Hardened by default
                    </h3>
                    <p className="mt-1.5 text-base leading-relaxed text-muted-foreground">
                      CSPRNG base62 codes, infinite-loop detection, and
                      per-endpoint rate limiting baked in from day one.
                    </p>
                  </div>
                </div>
                <div
                  className={cn(
                    MONO,
                    "space-y-2 rounded border border-border bg-background/60 p-4 text-sm",
                  )}
                >
                  <p className="text-muted-foreground">
                    {"// security smoke test"}
                  </p>
                  <p className="text-foreground/70">
                    <span className="text-lime-300">✓</span> javascript: blocked
                  </p>
                  <p className="text-foreground/70">
                    <span className="text-lime-300">✓</span> bit.ly rejected
                    (anti-loop)
                  </p>
                  <p className="text-foreground/70">
                    <span className="text-lime-300">✓</span> 21st req/min → 429
                  </p>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* 5 · How it works */}
      <section id="how-it-works" className="border-t border-border">
        <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
          <Reveal>
            <span
              className={cn(
                MONO,
                "text-xs uppercase tracking-[0.16em] text-lime-300",
              )}
            >
              Pipeline
            </span>
            <h2 className="mt-3 font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              Three lines, then watch it move.
            </h2>
          </Reveal>

          <div className="mt-14 grid gap-5 md:grid-cols-3">
            {[
              [
                "01",
                "Paste",
                "Drop in any long URL. It's validated, scanned for schemes, and guarded against self-loops.",
              ],
              [
                "02",
                "Share",
                "Get a clean 7-char code. Copy it anywhere — posts, bios, campaigns.",
              ],
              [
                "03",
                "Monitor",
                "Watch clicks, devices, referrers, and locations stream in live.",
              ],
            ].map(([n, t, d], i) => (
              <Reveal key={n} delay={i * 0.08}>
                <div className="group relative h-full rounded-xl border border-border bg-card p-7 transition-colors hover:border-lime-400/30">
                  <div className="flex items-baseline justify-between">
                    <span
                      className={cn(
                        MONO,
                        "text-3xl font-bold text-lime-300/80",
                      )}
                    >
                      {n}
                    </span>
                    {i < 2 && (
                      <ArrowUpRight className="size-5 text-muted-foreground/40 transition-colors group-hover:text-lime-300" />
                    )}
                  </div>
                  <h3 className="mt-6 font-display text-xl font-semibold text-foreground">
                    {t}
                  </h3>
                  <p className="mt-2.5 text-base leading-relaxed text-muted-foreground">
                    {d}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* 6 · FAQ */}
      <section id="faq" className="border-t border-border">
        <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-4">
              <Reveal>
                <span
                  className={cn(
                    MONO,
                    "text-xs uppercase tracking-[0.16em] text-lime-300",
                  )}
                >
                  System Knowledge
                </span>
                <h2 className="mt-3 font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
                  Frequently Asked Questions
                </h2>
                <p className="mt-4 text-base leading-relaxed text-muted-foreground">
                  Technical and transparent information regarding Shortlytics&apos;
                  architecture, privacy security, and analytics reliability.
                </p>

                <div className="mt-8 hidden lg:block">
                  <div className="rounded-xl border border-border/80 bg-card/40 p-5 backdrop-blur-sm">
                    <p
                      className={cn(
                        MONO,
                        "text-xs font-semibold text-lime-400",
                      )}
                    >
                      {"// telemetry disclaimer"}
                    </p>
                    <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                      Shortlytics never sells visitor data or embeds third-party
                      trackers. Privacy is a technical specification, not an
                      optional feature.
                    </p>
                  </div>
                </div>
              </Reveal>
            </div>

            <div className="lg:col-span-8">
              <Reveal delay={0.06}>
                <FaqAccordion />
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* 7 · Final CTA */}
      <section className="mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8">
        <Reveal>
          <div className="relative overflow-hidden rounded-xl border border-lime-400/30 bg-card px-8 py-16 text-center sm:px-16">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_bottom,rgba(163,230,53,0.12),transparent_60%)]"
            />
            <p
              className={cn(
                MONO,
                "text-xs uppercase tracking-[0.16em] text-lime-300",
              )}
            >
              {session?.user ? "Your links, on tap" : "Free. Open. Real-time."}
            </p>
            <h2 className="mx-auto mt-5 max-w-xl font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              Put your links on a live feed.
            </h2>
            <div className="mt-8 flex justify-center">
              <Link
                href={session?.user ? "/dashboard" : "/register"}
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "rounded-lg bg-lime-400 px-8 py-3.5 text-lg font-medium text-zinc-950 hover:bg-lime-300 active:scale-[0.98]",
                )}
              >
                {session?.user ? (
                  <RollingText>Open dashboard</RollingText>
                ) : (
                  <RollingText>Create account</RollingText>
                )}
                <ArrowUpRight className="ml-2 size-5" />
              </Link>
            </div>
          </div>
        </Reveal>
      </section>

      {/* 7 · Footer */}
      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-10 sm:flex-row sm:px-6 lg:px-8">
          <div className="flex items-center gap-2.5">
            <LogoIcon size="xs" animated={false} />
            <span className={cn(MONO, "text-sm text-muted-foreground")}>
              © 2026 shortlytics
            </span>
          </div>
          <p className={cn(MONO, "text-sm text-muted-foreground/70")}>
            Next.js 16 · PostgreSQL · Prisma 7 · Tailwind v4
          </p>
        </div>
      </footer>
    </div>
  );
}
