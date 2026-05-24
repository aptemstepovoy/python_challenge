"use client";

import { useStore } from "@/lib/store";
import { xpForToday } from "@/lib/daily-xp";
import { Progress } from "@/components/ui/progress";
import { Target } from "lucide-react";

export function DailyGoalBar() {
  const goal = useStore((s) => s.dailyXPGoal);
  const history = useStore((s) => s.dailyXPHistory);
  const today = xpForToday(history);
  const pct = goal > 0 ? Math.min(100, (today / goal) * 100) : 0;
  const hit = today >= goal;

  return (
    <div className="panel rounded-md p-3">
      <div className="flex items-center gap-3">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-surface-2 text-accent-bright">
          <Target className="h-3.5 w-3.5" strokeWidth={2.2} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline justify-between mb-1">
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-secondary">
              Цель дня
            </span>
            <span className="num text-xs">
              <span className={hit ? "text-ok-bright" : "text-foreground"}>
                {today}
              </span>
              <span className="text-secondary"> / {goal} XP</span>
            </span>
          </div>
          <Progress value={pct} tone={hit ? "ok" : "accent"} />
        </div>
      </div>
    </div>
  );
}
