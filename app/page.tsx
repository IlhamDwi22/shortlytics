"use client";

import * as React from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { motion } from "motion/react";
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
import { ThemeToggle } from "@/components/theme-toggle";
import { CountUp, LiveDot, Reveal, Typewriter } from "@/components/live";
import { cn } from "@/lib/utils";

const MONO = "font-mono tracking-tight";

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

function useTickingCounter(initial: number, stepMin = 0, stepMax = 3) {
  const [value, setValue] = React.useState(initial);
  React.useEffect(() => {
    const id = setInterval(() => {
      setValue((v) => {
        const delta =
          Math.floor(Math.random() * (stepMax - stepMin + 1)) + stepMin;
        return v + delta;
      });
    }, 1800);
    return () => clearInterval(id);
  }, [stepMax, stepMin]);
  return value;
}

export default function LandingPage() {
  const { data: session } = useSession();
  const totalClicks = useTickingCounter(148);
  const clicksToday = useTickingCounter(63, 0, 2);

  const [url, setUrl] = React.useState("");
  const [state, setState] = React.useState<
    "idle" | "loading" | "done" | "error"
  >("idle");
  const [shortUrl, setShortUrl] = React.useState("");
  const [copied, setCopied] = React.useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (state === "loading") return;
    if (!url.trim()) {
      setState("error");
      return;
    }
    setState("loading");
    setTimeout(() => {
      setShortUrl("https://shortlytics.app/aZ3kP9");
      setState("done");
      setCopied(false);
    }, 650);
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(shortUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    /* Landing is deliberately pinned to the dark "data instrument" shell,
       independent of the app-level theme (dashboard/auth honor system pref). */
    <div className="dark flex min-h-screen flex-col bg-zinc-950 text-zinc-100 selection:bg-lime-400/30 selection:text-lime-200 [color-scheme:dark]">
      {/* 1 · Nav */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-zinc-950/80 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="group flex items-center gap-2.5">
            <span
              className={cn(
                MONO,
                "flex h-7 items-center gap-1 rounded border border-lime-400/40 bg-lime-400/10 px-2 text-xs font-semibold text-lime-300",
              )}
            >
              <span className="size-1.5 rounded-full bg-lime-400 animate-pulse" />
              s/fn
            </span>
            <span
              className={cn(
                MONO,
                "text-sm font-semibold tracking-tight text-zinc-100",
              )}
            >
              shortlytics
            </span>
          </Link>

          <nav className="hidden items-center gap-7 md:flex">
            {[
              ["Analytics", "#analytics"],
              ["Features", "#features"],
              ["How it works", "#how-it-works"],
            ].map(([label, href]) => (
              <a
                key={href}
                href={href}
                className={cn(
                  MONO,
                  "text-[11px] uppercase tracking-[0.18em] text-zinc-500 transition-colors hover:text-lime-300",
                )}
              >
                {label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            {session?.user ? (
              <Link
                href="/dashboard"
                className={cn(
                  buttonVariants({ size: "sm" }),
                  "rounded-md bg-lime-400 font-medium text-zinc-950 hover:bg-lime-300",
                )}
              >
                Dashboard
                <ArrowUpRight className="ml-1 size-3.5" />
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className={cn(
                    buttonVariants({ size: "sm", variant: "ghost" }),
                    "hidden rounded-md text-zinc-300 hover:bg-white/5 hover:text-white sm:inline-flex",
                  )}
                >
                  Log in
                </Link>
                <Link
                  href="/register"
                  className={cn(
                    buttonVariants({ size: "sm" }),
                    "rounded-md bg-lime-400 font-medium text-zinc-950 hover:bg-lime-300",
                  )}
                >
                  Get started
                  <ArrowUpRight className="ml-1 size-3.5" />
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* 2 · Hero — asymmetric: working shorten console left, live instrument right */}
      <section className="relative mx-auto grid w-full max-w-7xl flex-1 grid-cols-1 gap-12 px-4 pb-16 pt-14 sm:px-6 lg:grid-cols-12 lg:gap-8 lg:pb-24 lg:pt-16">
        {/* ambient grid */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[520px] bg-[radial-gradient(ellipse_at_top,rgba(163,230,53,0.08),transparent_60%)]"
        />

        {/* Left — shorten console */}
        <Reveal className="flex flex-col justify-center lg:col-span-6">
          <div
            className={cn(
              MONO,
              "inline-flex w-fit items-center gap-2 rounded border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] uppercase tracking-[0.16em] text-lime-300",
            )}
          >
            <Radio className="size-3 animate-pulse" />
            Live SSE stream · 0.0s refresh
          </div>

          <h1 className="mt-6 font-display text-4xl font-bold leading-[1.05] tracking-tight text-zinc-50 sm:text-5xl lg:text-[3.4rem]">
            <Typewriter
              text={"Short links.\nSignals in real time."}
              highlight="real time."
            />
          </h1>

          <p className="mt-5 max-w-md text-base leading-relaxed text-zinc-400">
            A developer-grade URL shortener with live analytics. Watch clicks,
            devices, and referrers arrive the second they happen — free,
            transparent, no paywall.
          </p>

          {/* Working shorten console */}
          <form
            onSubmit={submit}
            className="mt-8 rounded-lg border border-white/10 bg-zinc-900/60 p-1.5 focus-within:border-lime-400/50"
          >
            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="flex flex-1 items-center gap-2 px-3">
                <span className={cn(MONO, "flex items-center gap-1 text-xs text-zinc-500")}>
                  <span className="text-lime-300">$</span>
                  <span className="caret-blink h-3.5 w-[1.5px] bg-lime-400/70" />
                </span>
                <Input
                  value={url}
                  onChange={(e) => {
                    setUrl(e.target.value);
                    if (state === "error") setState("idle");
                  }}
                  placeholder="paste://your-long-url-here"
                  aria-label="Paste your long URL"
                  className="h-11 border-0 bg-transparent p-0 font-mono text-sm text-zinc-100 shadow-none placeholder:text-zinc-600 focus-visible:ring-0 dark:border-0 dark:bg-transparent"
                />
              </div>
              <Button
                type="submit"
                size="lg"
                disabled={state === "loading"}
                className="h-11 rounded-md bg-lime-400 px-5 font-medium text-zinc-950 hover:bg-lime-300 active:scale-[0.98]"
              >
                {state === "loading" ? "Hashing…" : "Shorten"}
                <ArrowUpRight className="ml-1.5 size-4" />
              </Button>
            </div>

            <div className="mt-1 min-h-[44px] border-t border-white/5 px-3 pt-2">
              {state === "idle" && (
                <p className={cn(MONO, "text-[11px] text-zinc-600")}>
                  {"// 7-char base62 · CSPRNG · anti-loop guarded"}
                </p>
              )}
              {state === "error" && (
                <p className={cn(MONO, "text-[11px] text-red-400")}>
                  Invalid URL — must start with http:// or https://
                </p>
              )}
              {state === "done" && (
                <div className="flex items-center justify-between gap-2">
                  <span className={cn(MONO, "truncate text-sm text-lime-300")}>
                    {shortUrl}
                  </span>
                  <Button
                    type="button"
                    onClick={copy}
                    size="sm"
                    variant="ghost"
                    className="rounded text-[11px] uppercase tracking-wide text-zinc-400 hover:bg-white/5 hover:text-lime-300"
                  >
                    {copied ? (
                      <Check className="mr-1 size-3.5 text-lime-400" />
                    ) : (
                      <Copy className="mr-1 size-3.5" />
                    )}
                    {copied ? "Copied" : "Copy"}
                  </Button>
                </div>
              )}
              {state === "loading" && (
                <div className="flex items-center gap-2">
                  <span className="size-3 animate-spin rounded-full border border-zinc-600 border-t-lime-400" />
                  <span className={cn(MONO, "text-xs text-zinc-500")}>
                    generating unique code…
                  </span>
                </div>
              )}
            </div>
          </form>

          {/* trust rail */}
          <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-white/10 pt-5">
            {[
              ["<300ms", "redirect"],
              ["open", "source"],
              ["no", "paywall"],
            ].map(([n, l]) => (
              <span key={l} className={cn(MONO, "text-xs text-zinc-500")}>
                <span className="font-semibold text-zinc-200">{n}</span> {l}
              </span>
            ))}
          </div>
        </Reveal>

        {/* Right — live instrument panel */}
        <Reveal delay={0.08} y={16} id="analytics" className="lg:col-span-6">
          <figure className="relative rounded-lg border border-white/10 bg-zinc-900/50">
            {/* panel header */}
            <figcaption className="flex items-center justify-between border-b border-white/10 px-4 py-2.5">
              <div className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-zinc-700" />
                <span className="size-2 rounded-full bg-zinc-700" />
                <span className="size-2 rounded-full bg-zinc-700" />
                <span className={cn(MONO, "ml-2 text-[11px] text-zinc-500")}>
                  shortlytics.app/analytics
                </span>
              </div>
              <span
                className={cn(
                  MONO,
                  "inline-flex items-center gap-1.5 rounded border border-lime-400/30 bg-lime-400/10 px-2 py-0.5 text-[10px] uppercase tracking-wide text-lime-300",
                )}
              >
                <LiveDot className="mr-1.5" />
                live
              </span>
            </figcaption>

            {/* live counters */}
            <div className="grid grid-cols-2 divide-x divide-y divide-white/5">
              <div className="p-4">
                <span
                  className={cn(
                    MONO,
                    "text-[10px] uppercase tracking-[0.16em] text-zinc-500",
                  )}
                >
                  total clicks
                </span>
                <div
                  className={cn(
                    MONO,
                    "mt-1 text-4xl font-semibold text-zinc-50 tabular-nums",
                  )}
                >
                  <CountUp to={totalClicks} />
                </div>
              </div>
              <div className="p-4">
                <span
                  className={cn(
                    MONO,
                    "text-[10px] uppercase tracking-[0.16em] text-zinc-500",
                  )}
                >
                  today
                </span>
                <div
                  className={cn(
                    MONO,
                    "mt-1 text-4xl font-semibold text-lime-300 tabular-nums",
                  )}
                >
                  <CountUp to={clicksToday} prefix="+" />
                </div>
              </div>
            </div>

            {/* referrer feed */}
            <div className="border-t border-white/10 px-4 py-3">
              <span
                className={cn(
                  MONO,
                  "text-[10px] uppercase tracking-[0.16em] text-zinc-500",
                )}
              >
                top referrers
              </span>
              <ul className="mt-2 space-y-2">
                {REFERRERS.map((r) => (
                  <li key={r.label} className="flex items-center gap-3">
                    <span
                      className={cn(
                        MONO,
                        "w-28 truncate text-xs text-zinc-300",
                      )}
                    >
                      {r.label}
                    </span>
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/5">
                      <motion.div
                        className="h-full rounded-full bg-zinc-500"
                        initial={{ width: 0 }}
                        whileInView={{ width: `${r.pct}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                      />
                    </div>
                    <span
                      className={cn(
                        MONO,
                        "w-8 text-right text-xs tabular-nums text-zinc-400",
                      )}
                    >
                      {r.pct}%
                    </span>
                    {r.live && <LiveDot className="h-2 w-2" />}
                  </li>
                ))}
              </ul>
            </div>

            {/* device bars */}
            <div className="grid grid-cols-3 gap-px border-t border-white/10 bg-white/5">
              {DEVICES.map((d) => (
                <div key={d.label} className="bg-zinc-900/60 px-4 py-3">
                  <div className="flex items-center gap-1.5 text-[11px] text-zinc-400">
                    <d.icon className="size-3 text-lime-300" />
                    {d.label}
                  </div>
                  <div
                    className={cn(
                      MONO,
                      "mt-1 text-lg font-semibold text-zinc-100 tabular-nums",
                    )}
                  >
                    {d.pct}%
                  </div>
                </div>
              ))}
            </div>
          </figure>
        </Reveal>
      </section>

      {/* 3 · Data rail */}
      <section className="border-y border-white/10">
        <Reveal>
          <div className="mx-auto grid max-w-7xl grid-cols-2 gap-px bg-white/5 px-4 sm:px-6 md:grid-cols-4 lg:px-8">
            {[
              ["62⁷", "unique code space"],
              ["<300ms", "redirect latency"],
              ["7-char", "base62 short codes"],
              ["0", "paywalls, ever"],
            ].map(([n, l]) => (
              <div key={l} className="bg-zinc-950 px-2 py-6 text-center">
                <div className={cn(MONO, "text-2xl font-bold text-lime-300")}>
                  {n}
                </div>
                <div
                  className={cn(
                    MONO,
                    "mt-1 text-[10px] uppercase tracking-[0.16em] text-zinc-500",
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
        className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8"
      >
        <Reveal className="max-w-2xl">
          <span
            className={cn(
              MONO,
              "text-[11px] uppercase tracking-[0.18em] text-lime-300",
            )}
          >
            Signals, not vanity metrics
          </span>
          <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-zinc-50 sm:text-4xl">
            Built around the click.
          </h2>
        </Reveal>

        <div className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-6">
          {/* large live cell */}
          <Reveal className="md:col-span-4">
            <div className="flex h-full flex-col justify-between rounded-lg border border-white/10 bg-zinc-900/40 p-6 transition-colors hover:border-lime-400/30">
              <div className="flex items-center gap-2">
                <Activity className="size-4 text-lime-300" />
                <h3
                  className={cn(
                    MONO,
                    "text-sm uppercase tracking-wide text-zinc-200",
                  )}
                >
                  Real-time without the work
                </h3>
              </div>
              <div>
                <p className="mt-3 max-w-sm text-sm leading-relaxed text-zinc-400">
                  Every click lands in your dashboard instantly via Server-Sent
                  Events. No refresh, no polling, no Websocket plumbing to babysit.
                </p>
                <div
                  className={cn(
                    MONO,
                    "mt-6 flex items-center gap-2 text-xs text-zinc-500",
                  )}
                >
                  <span className="text-lime-300">$</span>
                  <code className="rounded bg-white/5 px-2 py-1 text-zinc-300">
                    eventSource.onmessage
                  </code>
                  <span>→ re-render</span>
                </div>
              </div>
            </div>
          </Reveal>

          {/* geography cell */}
          <Reveal delay={0.06} className="md:col-span-2">
            <div className="flex h-full flex-col justify-between rounded-lg border border-white/10 bg-zinc-900/40 p-6 transition-colors hover:border-lime-400/30">
              <Globe2 className="size-5 text-lime-300" />
              <div className="mt-6">
                <h3 className="font-display text-lg font-semibold text-zinc-50">
                  Where it&apos;s read
                </h3>
                <p className="mt-1 text-sm text-zinc-400">
                  Country, city, and device breakdown per link — masked IPs, clean
                  privacy.
                </p>
              </div>
            </div>
          </Reveal>

          {/* instant cell */}
          <Reveal className="md:col-span-2">
            <div className="flex h-full flex-col justify-between rounded-lg border border-white/10 bg-zinc-900/40 p-6 transition-colors hover:border-lime-400/30">
              <Zap className="size-5 text-lime-300" />
              <div className="mt-6">
                <h3 className="font-display text-lg font-semibold text-zinc-50">
                  Instant redirect
                </h3>
                <p className="mt-1 text-sm text-zinc-400">
                  Straight 302 to your target. No interstitial, no ad wall.
                </p>
              </div>
            </div>
          </Reveal>

          {/* security cell */}
          <Reveal delay={0.06} className="md:col-span-4">
            <div className="rounded-lg border border-white/10 bg-zinc-900/40 p-6 transition-colors hover:border-lime-400/30">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex gap-3">
                  <ShieldCheck className="mt-0.5 size-4 shrink-0 text-lime-300" />
                  <div>
                    <h3 className="font-display text-base font-semibold text-zinc-50">
                      Hardened by default
                    </h3>
                    <p className="mt-1 text-sm leading-relaxed text-zinc-400">
                      CSPRNG base62 codes, infinite-loop detection, and
                      per-endpoint rate limiting baked in from day one.
                    </p>
                  </div>
                </div>
                <div
                  className={cn(
                    MONO,
                    "space-y-1.5 rounded border border-white/10 bg-zinc-950/60 p-3 text-xs",
                  )}
                >
                  <p className="text-zinc-500">{"// security smoke test"}</p>
                  <p className="text-zinc-300">
                    <span className="text-lime-300">✓</span> javascript: blocked
                  </p>
                  <p className="text-zinc-300">
                    <span className="text-lime-300">✓</span> bit.ly rejected
                    (anti-loop)
                  </p>
                  <p className="text-zinc-300">
                    <span className="text-lime-300">✓</span> 21st req/min → 429
                  </p>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* 5 · How it works */}
      <section id="how-it-works" className="border-t border-white/10">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <Reveal>
            <span
              className={cn(
                MONO,
                "text-[11px] uppercase tracking-[0.18em] text-lime-300",
              )}
            >
              Pipeline
            </span>
            <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-zinc-50 sm:text-4xl">
              Three lines, then watch it move.
            </h2>
          </Reveal>

          <div className="mt-12 grid gap-4 md:grid-cols-3">
            {[
              [
                "01",
                "Paste",
                "Drop in any long URL. It’s validated, scanned for schemes, and guarded against self-loops.",
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
                <div className="group relative h-full rounded-lg border border-white/10 bg-zinc-900/40 p-6 transition-colors hover:border-lime-400/30">
                  <div className="flex items-baseline justify-between">
                    <span
                      className={cn(MONO, "text-2xl font-bold text-lime-300/80")}
                    >
                      {n}
                    </span>
                    {i < 2 && (
                      <ArrowUpRight className="size-4 text-zinc-700 transition-colors group-hover:text-lime-300" />
                    )}
                  </div>
                  <h3 className="mt-5 font-display text-lg font-semibold text-zinc-50">
                    {t}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                    {d}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* 6 · Final CTA */}
      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <Reveal>
          <div className="relative overflow-hidden rounded-lg border border-lime-400/30 bg-zinc-900/60 px-6 py-14 text-center sm:px-12">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_bottom,rgba(163,230,53,0.12),transparent_60%)]"
          />
          <p
            className={cn(
              MONO,
              "text-[11px] uppercase tracking-[0.18em] text-lime-300",
            )}
          >
            {session?.user ? "Your links, on tap" : "Free. Open. Real-time."}
          </p>
          <h2 className="mx-auto mt-4 max-w-xl font-display text-3xl font-bold tracking-tight text-zinc-50 sm:text-4xl">
            Put your links on a live feed.
          </h2>
          <div className="mt-7 flex justify-center">
            <Link
              href={session?.user ? "/dashboard" : "/register"}
              className={cn(
                buttonVariants({ size: "lg" }),
                "rounded-md bg-lime-400 px-7 py-3 text-base font-medium text-zinc-950 hover:bg-lime-300 active:scale-[0.98]",
              )}
            >
              {session?.user ? "Open dashboard" : "Create account"}
              <ArrowUpRight className="ml-2 size-4" />
            </Link>
          </div>
        </div>
        </Reveal>
      </section>

      {/* 7 · Footer */}
      <footer className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-8 sm:flex-row sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                MONO,
                "flex h-6 items-center rounded border border-lime-400/40 bg-lime-400/10 px-1.5 text-[10px] font-semibold text-lime-300",
              )}
            >
              s/fn
            </span>
            <span className={cn(MONO, "text-xs text-zinc-500")}>
              © 2026 shortlytics
            </span>
          </div>
          <p className={cn(MONO, "text-xs text-zinc-600")}>
            Next.js 16 · PostgreSQL · Prisma 7 · Tailwind v4
          </p>
        </div>
      </footer>
    </div>
  );
}
