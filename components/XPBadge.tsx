"use client";

import { useStore } from "@/lib/store";
import { levelFromXP, progressWithinLevel, xpToNextLevel } from "@/lib/xp";
import { CountUp } from "@/components/CountUp";
import { Progress } from "@/components/ui/progress";

export function XPBadge({ compact = false }: { compact?: boolean }) {
  const xp = useStore((s) => s.xp);
  const lvl = levelFromXP(xp);
  const pct = progressWithinLevel(xp);
  const toNext = xpToNextLevel(xp);

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <span className="font-mono text-[10px] uppercase tracking-wider text-muted">
          L{lvl.num}
        </span>
        <span className="num text-xs text-foreground">
          <CountUp value={xp} duration={500} /> XP
        </span>
      </div>
    );
  }

  return (
    <div className="rounded border border-border bg-surface p-4">
      <div className="mb-2 flex items-baseline justify-between">
        <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-muted">
          L{lvl.num} · {lvl.title}
        </span>
        <span className="num text-base text-foreground">
          <CountUp value={xp} duration={600} /> XP
        </span>
      </div>
      <Progress value={pct} tone="accent" />
      {toNext > 0 && (
        <div className="mt-2 font-mono text-[10px] uppercase tracking-wider text-muted">
          до следующего уровня <span className="num text-foreground/70">{toNext}</span> XP
        </div>
      )}
    </div>
  );
}
