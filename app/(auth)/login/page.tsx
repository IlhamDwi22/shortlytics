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
import { Logo } from "@/components/logo";
import { cn } from "@/lib/utils";

const MONO = "font-mono tracking-tight";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawCallbackUrl = searchParams.get("callbackUrl") || "/dashboard";
  const callbackUrl =
    rawCallbackUrl.startsWith("/") && !rawCallbackUrl.startsWith("//")
      ? rawCallbackUrl
      : "/dashboard";

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const registered = searchParams.get("registered") === "true";

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
        setError("Incorrect email or password.");
        setIsLoading(false);
        return;
      }

      router.push(callbackUrl);
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again in a moment.");
      setIsLoading(false);
    }
  };

  return (
    <div className="rounded-xl border border-border bg-card p-8 shadow-lg sm:p-10">
      {registered && (
        <div className="mb-6 flex items-center gap-3 rounded-lg border border-lime-500/20 bg-lime-500/10 p-4 text-base text-lime-300">
          <span className="size-2 rounded-full bg-lime-400" />
          <span>Account created. Please sign in.</span>
        </div>
      )}
      {error && (
        <div className="mb-6 flex items-center gap-3 rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-base text-red-400">
          <AlertCircle className="size-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label
            htmlFor="email"
            className={cn(MONO, "text-sm font-medium uppercase tracking-wider text-muted-foreground")}
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
            className="h-12 border-border bg-background text-base text-foreground placeholder:text-muted-foreground/60 focus-visible:border-lime-400/50 focus-visible:ring-lime-400/20"
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="password"
            className={cn(MONO, "text-sm font-medium uppercase tracking-wider text-muted-foreground")}
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
            className="h-12 border-border bg-background text-base text-foreground placeholder:text-muted-foreground/60 focus-visible:border-lime-400/50 focus-visible:ring-lime-400/20"
          />
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className="h-12 w-full rounded-lg bg-lime-400 text-base font-medium text-zinc-950 hover:bg-lime-300 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 size-5 animate-spin" />
              Signing in...
            </>
          ) : (
            <>
              <RollingText>Sign in</RollingText>
              <ArrowUpRight className="ml-1.5 size-5" />
            </>
          )}
        </Button>
      </form>

      <div className="mt-8 border-t border-border pt-6 text-center text-base text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link
          href="/register"
          className="font-semibold text-primary-600 transition-colors hover:text-primary-700 dark:text-lime-300 dark:hover:text-lime-200"
        >
          Sign up
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
          <Link href="/" className="group flex items-center">
            <Logo size="md" />
          </Link>
          <h1 className="mt-7 font-display text-4xl font-bold tracking-tight text-foreground">
            Welcome back
          </h1>
          <p className="mt-2.5 text-base text-muted-foreground">
            Sign in to your account to manage your short URLs and analytics
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
