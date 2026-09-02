"use client";

import { Toaster as Sonner } from "sonner";

function Toaster() {
  return (
    <Sonner
      theme="dark"
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-zinc-900 group-[.toaster]:border-white/10 group-[.toaster]:text-zinc-100 group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-zinc-400",
          actionButton:
            "group-[.toast]:bg-lime-400 group-[.toast]:text-zinc-950 group-[.toast]:font-medium",
          cancelButton:
            "group-[.toast]:bg-zinc-800 group-[.toast]:text-zinc-400",
        },
      }}
    />
  );
}

export { Toaster };
