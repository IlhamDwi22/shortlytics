import Link from "next/link";
import { Link2Off, ArrowLeft } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-16 text-center sm:px-6 lg:px-8">
      <div className="mx-auto max-w-md space-y-6">
        <div className="mx-auto flex size-20 items-center justify-center rounded-3xl bg-primary-100 text-primary-600 shadow-md dark:bg-primary-950/50 dark:text-primary-400">
          <Link2Off className="size-10" />
        </div>

        <div className="space-y-2">
          <h1 className="font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            404
          </h1>
          <h2 className="font-display text-xl font-semibold text-foreground">
            Link Tidak Ditemukan
          </h2>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            Tautan pendek yang Anda akses tidak ditemukan, telah dinonaktifkan,
            atau sudah dihapus oleh pemiliknya.
          </p>
        </div>

        <div className="pt-4">
          <Link
            href="/"
            className={cn(
              buttonVariants({ variant: "default" }),
              "bg-primary-600 font-medium text-white shadow-primary hover:bg-primary-700 h-10 px-4 py-2"
            )}
          >
            <ArrowLeft className="mr-2 size-4" />
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    </div>
  );
}
