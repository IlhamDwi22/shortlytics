"use client";

import * as React from "react";
import { Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Loader2, AlertCircle, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RollingText } from "@/components/rolling-text";
import { cn } from "@/lib/utils";

const MONO = "font-mono tracking-tight";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email: email.trim(),
        password,
        callbackUrl,
      });

      if (!res?.ok || res.error) {
        setError("Email atau password yang Anda masukkan salah.");
        setIsLoading(false);
        return;
      }

      router.push(callbackUrl);
      router.refresh();
    } catch {
      setError("Terjadi kesalahan. Silakan coba beberapa saat lagi.");
      setIsLoading(false);
    }
  };

  return (
    <div className="rounded-lg border border-border bg-card p-6 shadow-lg sm:p-8">
      {error && (
        <div className="mb-6 flex items-center gap-3 rounded-md border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
          <AlertCircle className="size-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-1.5">
          <label
            htmlFor="email"
            className={cn(MONO, "text-xs font-medium uppercase tracking-wider text-muted-foreground")}
          >
            Email
          </label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="nama@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
            className="border-border bg-background text-foreground placeholder:text-muted-foreground/60 focus-visible:border-lime-400/50 focus-visible:ring-lime-400/20"
          />
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="password"
            className={cn(MONO, "text-xs font-medium uppercase tracking-wider text-muted-foreground")}
          >
            Password
          </label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
            className="border-border bg-background text-foreground placeholder:text-muted-foreground/60 focus-visible:border-lime-400/50 focus-visible:ring-lime-400/20"
          />
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full bg-lime-400 font-medium text-zinc-950 hover:bg-lime-300 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" />
              Memproses...
            </>
          ) : (
            <>
              <RollingText>Masuk ke Akun</RollingText>
              <ArrowUpRight className="ml-1.5 size-4" />
            </>
          )}
        </Button>
      </form>

      <div className="mt-6 border-t border-border pt-6 text-center text-sm text-muted-foreground">
        Belum punya akun?{" "}
        <Link
          href="/register"
          className="font-semibold text-lime-300 transition-colors hover:text-lime-200"
        >
          Daftar sekarang
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-12 text-foreground sm:px-6 lg:px-8">
      {/* Ambient glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,rgba(163,230,53,0.06),transparent_60%)]"
      />

      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center text-center">
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
          <h1 className="mt-6 font-display text-3xl font-bold tracking-tight text-foreground">
            Welcome back
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Masuk ke akun Anda untuk mengelola short URL dan analytics
          </p>
        </div>

        <Suspense
          fallback={
            <div className="flex justify-center p-8">
              <Loader2 className="size-8 animate-spin text-lime-400" />
            </div>
          }
        >
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
