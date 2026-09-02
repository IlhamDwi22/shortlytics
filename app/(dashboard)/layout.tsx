"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { LayoutDashboard, LogOut, ArrowUpRight } from "lucide-react";
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
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      {/* Top nav */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur">
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
                  "text-sm font-semibold tracking-tight text-foreground"
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
                    ? "bg-muted text-lime-300"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <LayoutDashboard className="size-3.5" />
                Dashboard
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-2">
            {session?.user && (
              <span className={cn(MONO, "hidden text-xs text-muted-foreground sm:inline")}>
                {session.user.email}
              </span>
            )}
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className={cn(
                "flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
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
      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-6 sm:flex-row sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                MONO,
                "flex h-6 items-center rounded border border-lime-400/40 bg-lime-400/10 px-1.5 text-[10px] font-semibold text-lime-300"
              )}
            >
              s/fn
            </span>
            <span className={cn(MONO, "text-xs text-muted-foreground")}>
              © 2026 shortlytics
            </span>
          </div>
          <Link
            href="/"
            className={cn(
              MONO,
              "flex items-center gap-1 text-[11px] text-muted-foreground transition-colors hover:text-foreground"
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
