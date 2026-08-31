import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border bg-background px-3.5 py-2 text-sm text-foreground transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-neutral-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:bg-neutral-50 disabled:text-neutral-400 dark:disabled:bg-neutral-900/50",
          error
            ? "border-error-500 focus-visible:border-error-500 focus-visible:ring-error-100 dark:focus-visible:ring-error-500/20"
            : "border-neutral-200 hover:border-neutral-400 focus-visible:border-primary-500 focus-visible:ring-primary-200 dark:border-neutral-700 dark:hover:border-neutral-500 dark:focus-visible:border-primary-400 dark:focus-visible:ring-primary-900/50",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
