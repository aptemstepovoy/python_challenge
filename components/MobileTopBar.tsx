"use client";

import { useEffect, useState } from "react";
import { daysSinceStart } from "@/lib/utils";
import { useStore } from "@/lib/store";
import { levelFromXP } from "@/lib/xp";
import { CountUp } from "@/components/CountUp";

export function MobileTopBar() {
  const [now, setNow] = useState<Date | null>(null);
  const xp = useStore((s) => s.xp);
  const lvl = levelFromXP(xp);

  useEffect(() => {
    setNow(new Date());
    const t = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(t);
  }, []);

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between border-b border-border bg-surface px-4 py-3 md:hidden">
      <div className="flex items-baseline gap-2">
        <span className="font-mono text-sm tracking-[0.2em] text-foreground">
          OPERATOR
        </span>
        <span className="font-mono text-[9px] uppercase tracking-wider text-muted">
          L{lvl.num}
        </span>
      </div>
      <div className="flex items-center gap-3">
        <span className="num text-[11px] text-accent">
          <CountUp value={xp} duration={500} /> XP
        </span>
        <span className="num text-[10px] text-muted">
          {now ? `D${daysSinceStart(now)}` : ""}
        </span>
      </div>
    </header>
  );
}
