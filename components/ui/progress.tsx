"use client";

import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";
import { cn } from "@/lib/utils";

type Tone = "accent" | "ok" | "warn" | "danger";

const toneClass: Record<Tone, string> = {
  accent:
    "bg-gold-fill shadow-[0_0_10px_rgba(243,201,122,0.45)]",
  ok: "bg-gradient-to-b from-ok-bright via-ok to-[#2c5a3a] shadow-[0_0_8px_rgba(125,194,141,0.45)]",
  warn:
    "bg-gold-fill shadow-[0_0_8px_rgba(212,165,116,0.35)]",
  danger:
    "bg-gradient-to-b from-danger-bright via-danger to-[#5a1f1f] shadow-[0_0_8px_rgba(228,103,103,0.45)]",
};

export const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> & { tone?: Tone }
>(({ className, value, tone = "accent", ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    className={cn(
      "relative h-2 w-full overflow-hidden rounded-sm bg-black/60 border border-black/40",
      className
    )}
    style={{ boxShadow: "inset 0 1px 0 rgba(0,0,0,0.5)" }}
    {...props}
  >
    <ProgressPrimitive.Indicator
      className={cn("h-full w-full flex-1 transition-all", toneClass[tone])}
      style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
    />
  </ProgressPrimitive.Root>
));
Progress.displayName = ProgressPrimitive.Root.displayName;
