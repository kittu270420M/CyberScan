import * as React from "react";
import { cn } from "@/lib/utils";

export function Input({ className, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      className={cn(
        "h-11 w-full rounded-xs border border-border bg-[#0f1d32] px-3 text-sm text-foreground outline-none placeholder:text-muted-foreground/75 focus-visible:ring-2 focus-visible:ring-ring/60",
        className,
      )}
      {...props}
    />
  );
}
