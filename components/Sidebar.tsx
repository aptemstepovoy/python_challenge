"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { cn, daysSinceStart, formatWeekday } from "@/lib/utils";
import { useStore } from "@/lib/store";
import { levelFromXP, progressWithinLevel } from "@/lib/xp";
import { CountUp } from "@/components/CountUp";
import { Progress } from "@/components/ui/progress";

const items = [
  { href: "/today", label: "Today" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/habits", label: "Habits" },
  { href: "/tasks", label: "Tasks" },
  { href: "/bosses", label: "Bosses" },
  { href: "/achievements", label: "Achievements" },
  { href: "/review", label: "Review" },
];

export function Sidebar() {
  const pathname = usePathname();
  const [now, setNow] = useState<Date | null>(null);
  const xp = useStore((s) => s.xp);
  const lvl = levelFromXP(xp);
  const lvlPct = progressWithinLevel(xp);

  useEffect(() => {
    setNow(new Date());
    const t = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(t);
  }, []);

  return (
    <aside className="hidden w-60 shrink-0 flex-col justify-between border-r border-border bg-panel px-5 py-6 md:flex">
      <div>
        <div className="display mb-1 text-lg text-accent-bright text-glow tracking-[0.18em]">
          OPERATOR
        </div>
        <div className="mb-6 text-[11px] italic leading-snug text-muted">
          К свободе через систему
        </div>
        <div className="ornament mb-6" />

        <nav className="flex flex-col gap-0.5">
          {items.map((item) => {
            const active = pathname === item.href || pathname?.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded px-3 py-2 font-mono text-[12px] uppercase tracking-[0.15em] transition-colors",
                  active
                    ? "bg-surface-2 text-accent-bright border-l-2 border-accent pl-[10px] text-glow-soft"
                    : "text-muted hover:bg-surface-2 hover:text-accent-bright"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="space-y-3 border-t border-border pt-4 text-xs text-muted">
        <div className="space-y-1.5">
          <div className="flex items-baseline justify-between">
            <span className="font-mono uppercase tracking-wider">
              L{lvl.num} · {lvl.title}
            </span>
            <span className="num text-foreground">
              <CountUp value={xp} duration={500} /> XP
            </span>
          </div>
          <Progress value={lvlPct} tone="accent" />
        </div>
        {now ? (
          <div>
            <div className="font-mono uppercase tracking-wider">
              {formatWeekday(now)}
            </div>
            <div className="mt-1 num text-foreground">
              День {daysSinceStart(now)} / 365
            </div>
          </div>
        ) : (
          <div className="font-mono uppercase tracking-wider opacity-0">.</div>
        )}
      </div>
    </aside>
  );
}
