"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, Flame } from "lucide-react";
import { useStore } from "@/lib/store";
import {
  dailyHabits,
  perfectDaysStreak,
  todayCompletionRatio,
} from "@/lib/habits-logic";

export function StreakDangerBanner() {
  const habits = useStore((s) => s.habits);
  const habitLogs = useStore((s) => s.habitLogs);
  const streakFreezes = useStore((s) => s.streakFreezes);

  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const t = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(t);
  }, []);

  if (!now) return null;

  const hours = now.getHours();
  if (hours < 18) return null;

  const active = dailyHabits(habits, now);
  if (active.length === 0) return null;

  const { done } = todayCompletionRatio(habits, habitLogs, now);
  if (done > 0) return null;

  const streak = perfectDaysStreak(habits, habitLogs, now);
  if (streak < 3) return null;

  if (streakFreezes > 0) return null;

  const endOfDay = new Date(now);
  endOfDay.setHours(24, 0, 0, 0);
  const minsLeft = Math.max(0, Math.floor((endOfDay.getTime() - now.getTime()) / 60000));
  const hrsLeft = Math.floor(minsLeft / 60);
  const remMins = minsLeft % 60;

  return (
    <div className="rounded-md border border-danger/60 bg-danger/10 p-3 flex items-start gap-3">
      <AlertTriangle className="h-5 w-5 shrink-0 text-danger-bright" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-danger-bright">
          <Flame className="h-3 w-3" />
          Streak в опасности
        </div>
        <div className="text-sm text-foreground mt-0.5">
          Твой <span className="num text-danger-bright">{streak}-day</span> streak ломается.
          Осталось <span className="num">{hrsLeft}</span> ч{" "}
          <span className="num">{remMins}</span> мин. Сделай хотя бы 1 привычку.
        </div>
      </div>
    </div>
  );
}
