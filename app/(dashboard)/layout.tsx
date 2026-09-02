"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { LayoutDashboard, LogOut, ArrowUpRight } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Toaster } from "@/components/ui/toaster";
import { cn } from "@/lib/utils";

const MONO = "font-mono tracking-tight";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session } = useSession();
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen flex-col bg-zinc-950 text-zinc-100 [color-scheme:dark]">
      {/* Top nav */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-zinc-950/80 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-6">
            <Link href="/" className="group flex items-center gap-2.5">
              <span
                className={cn(
                  MONO,
                  "flex h-7 items-center gap-1 rounded border border-lime-400/40 bg-lime-400/10 px-2 text-xs font-semibold text-lime-300"
                )}
              >
                <span className="size-1.5 rounded-full bg-lime-400 animate-pulse" />
                s/fn
              </span>
              <span
                className={cn(
                  MONO,
                  "text-sm font-semibold tracking-tight text-zinc-100"
                )}
              >
                shortlytics
              </span>
            </Link>

            <nav className="hidden items-center gap-1 md:flex">
              <Link
                href="/dashboard"
                className={cn(
                  MONO,
                  "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[11px] uppercase tracking-[0.16em] transition-colors",
                  pathname === "/dashboard"
                    ? "bg-white/5 text-lime-300"
                    : "text-zinc-500 hover:text-zinc-300"
                )}
              >
                <LayoutDashboard className="size-3.5" />
                Dashboard
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            {session?.user && (
              <span className={cn(MONO, "hidden text-xs text-zinc-500 sm:inline")}>
                {session.user.email}
              </span>
            )}
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className={cn(
                "flex size-7 items-center justify-center rounded-md text-zinc-500 transition-colors hover:bg-white/5 hover:text-zinc-300"
              )}
              title="Sign out"
            >
              <LogOut className="size-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                MONO,
                "flex h-6 items-center rounded border border-lime-400/40 bg-lime-400/10 px-1.5 text-[10px] font-semibold text-lime-300"
              )}
            >
              s/fn
            </span>
            <span className={cn(MONO, "text-xs text-zinc-600")}>
              © 2026 shortlytics
            </span>
          </div>
          <Link
            href="/"
            className={cn(
              MONO,
              "flex items-center gap-1 text-[11px] text-zinc-600 transition-colors hover:text-zinc-400"
            )}
          >
            Back to home
            <ArrowUpRight className="size-3" />
          </Link>
        </div>
      </footer>

      <Toaster />
    </div>
  );
}
