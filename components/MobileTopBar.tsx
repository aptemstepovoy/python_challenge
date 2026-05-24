"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { User } from "lucide-react";
import { daysSinceStart } from "@/lib/utils";
import { useStore } from "@/lib/store";
import { levelFromXP } from "@/lib/xp";
import { CountUp } from "@/components/CountUp";
import { UserMenu } from "@/components/UserMenu";

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
    <header
      className="sticky top-0 z-40 flex items-center justify-between border-b border-border-bright bg-panel px-4 py-3 md:hidden"
      style={{ boxShadow: "0 8px 24px -8px rgba(0,0,0,0.6), inset 0 -1px 0 rgba(243,201,122,0.06)" }}
    >
      <Link href="/today" className="flex items-baseline gap-2">
        <span className="display text-base tracking-[0.18em] text-accent-bright text-glow-soft">
          OPERATOR
        </span>
        <span className="font-mono text-[9px] uppercase tracking-wider text-secondary">
          L{lvl.num}
        </span>
      </Link>
      <div className="flex items-center gap-3">
        <span className="num text-[11px] text-accent-bright">
          <CountUp value={xp} duration={500} /> XP
        </span>
        <span className="num text-[10px] text-secondary">
          {now ? `D${daysSinceStart(now)}` : ""}
        </span>
        <UserMenu
          trigger={
            <button
              aria-label="menu"
              className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-violet to-pink text-white"
            >
              <User className="h-4 w-4" />
            </button>
          }
        />
      </div>
    </header>
  );
}
