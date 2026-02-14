import * as React from "react";
import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => (
    <input
      type={type}
      className={cn(
        "flex h-9 w-full rounded-md border border-[var(--mongo-border)] bg-[var(--mongo-bg-medium)] px-3 py-2 text-sm text-[var(--mongo-text-primary)] placeholder:text-[var(--mongo-text-muted)] focus:outline-none focus:border-[#00ED64]/50 focus:ring-1 focus:ring-[#00ED64]/20 disabled:cursor-not-allowed disabled:opacity-50 file:border-0 file:bg-transparent file:text-sm file:font-medium",
        className
      )}
      ref={ref}
      {...props}
    />
  )
);
Input.displayName = "Input";

export { Input };
