"use client";

import { useEffect, useState } from "react";
import { daysSinceStart } from "@/lib/utils";

export function MobileTopBar() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const t = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(t);
  }, []);

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between border-b border-border bg-surface px-4 py-3 md:hidden">
      <div className="font-mono text-sm tracking-[0.2em] text-foreground">
        OPERATOR
      </div>
      <div className="num text-[11px] uppercase tracking-wider text-muted">
        {now ? `День ${daysSinceStart(now)} / 365` : ""}
      </div>
    </header>
  );
}
