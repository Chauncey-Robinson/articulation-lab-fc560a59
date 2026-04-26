import * as React from "react";

import { cn } from "@/lib/utils";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "flex min-h-[96px] w-full rounded-[18px] bg-[hsl(var(--surface-1))] px-5 py-4 text-[15px] font-sans leading-[1.6] text-foreground placeholder:text-ink-3 placeholder:italic ring-offset-background transition-colors focus-visible:outline-none focus-visible:bg-[hsl(var(--surface-2))] disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      ref={ref}
      {...props}
    />
  );
});
Textarea.displayName = "Textarea";

export { Textarea };
