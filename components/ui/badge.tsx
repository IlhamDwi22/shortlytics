import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2.5 py-1 text-xs font-medium font-mono uppercase tracking-wide",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-lime-400/10 text-lime-300",
        secondary:
          "border-transparent bg-muted text-foreground/70",
        destructive:
          "border-transparent bg-destructive/10 text-destructive",
        outline:
          "border-border text-muted-foreground",
        success:
          "border-transparent bg-emerald-500/10 text-emerald-400",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
