import * as React from "react";

import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-11 w-full rounded-[12px] bg-[hsl(var(--surface-1))] px-4 py-2.5 text-[15px] font-sans text-foreground placeholder:text-ink-3 ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring/40 focus-visible:bg-[hsl(var(--surface-2))] disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
