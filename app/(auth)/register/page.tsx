"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Loader2, AlertCircle, CheckCircle2, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RollingText } from "@/components/rolling-text";
import { cn } from "@/lib/utils";

const MONO = "font-mono tracking-tight";

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");

  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (password.length < 8) {
      setError("Password harus minimal 8 karakter.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Konfirmasi password tidak cocok.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim() || undefined,
          email: email.trim(),
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Gagal melakukan registrasi.");
        setIsLoading(false);
        return;
      }

      setSuccess("Registrasi berhasil! Menyiapkan sesi Anda...");

      const loginRes = await signIn("credentials", {
        redirect: false,
        email: email.trim(),
        password,
      });

      if (loginRes?.ok) {
        router.push("/dashboard");
        router.refresh();
      } else {
        router.push("/login?registered=true");
      }
    } catch {
      setError("Terjadi kesalahan jaringan. Silakan coba lagi.");
      setIsLoading(false);
    }
  };

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
            Create an account
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Daftar akun gratis dan mulai pantau performa short link Anda
          </p>
        </div>

        <div className="rounded-lg border border-border bg-card p-6 shadow-lg sm:p-8">
          {error && (
            <div className="mb-6 flex items-center gap-3 rounded-md border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
              <AlertCircle className="size-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-6 flex items-center gap-3 rounded-md border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-400">
              <CheckCircle2 className="size-5 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label
                htmlFor="name"
                className={cn(MONO, "text-xs font-medium uppercase tracking-wider text-muted-foreground")}
              >
                Nama Lengkap (Opsional)
              </label>
              <Input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                placeholder="Dio Pratama"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isLoading}
                className="border-border bg-background text-foreground placeholder:text-muted-foreground/60 focus-visible:border-lime-400/50 focus-visible:ring-lime-400/20"
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="email"
                className={cn(MONO, "text-xs font-medium uppercase tracking-wider text-muted-foreground")}
              >
                Email <span className="text-red-400">*</span>
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
                Password <span className="text-red-400">*</span>
              </label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                placeholder="Minimal 8 karakter"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                className="border-border bg-background text-foreground placeholder:text-muted-foreground/60 focus-visible:border-lime-400/50 focus-visible:ring-lime-400/20"
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="confirmPassword"
                className={cn(MONO, "text-xs font-medium uppercase tracking-wider text-muted-foreground")}
              >
                Konfirmasi Password <span className="text-red-400">*</span>
              </label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                placeholder="Ulangi password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isLoading}
                className="border-border bg-background text-foreground placeholder:text-muted-foreground/60 focus-visible:border-lime-400/50 focus-visible:ring-lime-400/20"
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="mt-2 w-full bg-lime-400 font-medium text-zinc-950 hover:bg-lime-300 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Mendaftarkan...
                </>
              ) : (
                <>
                  <RollingText>Daftar Akun Baru</RollingText>
                  <ArrowUpRight className="ml-1.5 size-4" />
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 border-t border-border pt-6 text-center text-sm text-muted-foreground">
            Sudah punya akun?{" "}
            <Link
              href="/login"
              className="font-semibold text-lime-300 transition-colors hover:text-lime-200"
            >
              Masuk di sini
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
