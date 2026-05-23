"use client";

import Link from "next/link";
import { useStore } from "@/lib/store";
import { computeBossState, nearestBoss } from "@/lib/bosses-logic";
import { initialBosses } from "@/lib/initial-data";
import { Progress } from "@/components/ui/progress";
import { differenceInCalendarDays, parseISO } from "date-fns";
import { ArrowRight } from "lucide-react";

export function BossProgressMini() {
  const tasks = useStore((s) => s.tasks);
  const habits = useStore((s) => s.habits);
  const habitLogs = useStore((s) => s.habitLogs);

  const states = initialBosses.map((b) =>
    computeBossState(b, tasks, habits, habitLogs)
  );
  const target = nearestBoss(states);
  if (!target) return null;

  const today = new Date();
  const daysLeft = differenceInCalendarDays(
    parseISO(target.boss.target_date),
    today
  );

  return (
    <Link
      href="/bosses"
      className="block rounded border border-border bg-surface p-4 hover:border-accent-dim transition-colors"
    >
      <div className="mb-2 flex items-center justify-between">
        <div className="font-mono text-[11px] uppercase tracking-[0.15em] text-muted">
          Ближайший босс — {target.boss.name}
        </div>
        <ArrowRight className="h-3.5 w-3.5 text-muted" />
      </div>
      <div className="mb-2 flex items-baseline justify-between font-mono text-[10px] uppercase tracking-wider text-muted">
        <span>
          HP{" "}
          <span className="num text-foreground">
            {target.hpRemaining}
          </span>{" "}
          / {target.boss.total_hp}
        </span>
        <span>
          {daysLeft >= 0 ? `${daysLeft} дн.` : `+${-daysLeft} дн. сверху`}
        </span>
      </div>
      <Progress value={100 - target.hpPercent} tone="accent" />
    </Link>
  );
}
