"use client";

import { useMemo } from "react";
import { useStore } from "@/lib/store";
import {
  dailyHabits,
  habitStreak,
  todayCompletionRatio,
} from "@/lib/habits-logic";
import { Flame, CheckCircle2, Scale, Zap, Target } from "lucide-react";
import { cn } from "@/lib/utils";

type Row = {
  icon: typeof Flame;
  color: string;
  label: string;
  value: string;
  big?: boolean;
};

export function TodaySummary() {
  const tasks = useStore((s) => s.tasks);
  const habits = useStore((s) => s.habits);
  const habitLogs = useStore((s) => s.habitLogs);
  const kgis = useStore((s) => s.kgis);

  const rows: Row[] = useMemo(() => {
    const today = new Date();
    const todayISO = today.toISOString().slice(0, 10);
    const ratio = todayCompletionRatio(habits, habitLogs, today);

    let bestHabit: { name: string; streak: number } | null = null;
    for (const h of dailyHabits(habits, today)) {
      const s = habitStreak(habitLogs, h.id, today);
      if (!bestHabit || s > bestHabit.streak) {
        bestHabit = { name: h.name, streak: s };
      }
    }

    const w = kgis.find((k) => k.id === "weight");
    const wStart = Number(w?.start_value ?? 110);
    const wCur = Number(w?.current_value ?? wStart);
    const wDelta = Math.round((wCur - wStart) * 10) / 10;

    const doneToday = tasks.filter(
      (t) =>
        t.status === "done" &&
        t.completed_at &&
        t.completed_at.slice(0, 10) === todayISO
    ).length;
    const doneTotal = tasks.filter((t) => t.status === "done").length;

    const open = tasks.filter((t) => t.status !== "done").length;

    const out: Row[] = [
      {
        icon: Flame,
        color: "text-pink-bright",
        label: bestHabit && bestHabit.streak > 0
          ? `${bestHabit.name}`
          : "Лучший streak",
        value: bestHabit && bestHabit.streak > 0
          ? `${bestHabit.streak} ${bestHabit.streak === 1 ? "день" : bestHabit.streak < 5 ? "дня" : "дней"} подряд`
          : "пока нет",
      },
      {
        icon: CheckCircle2,
        color: "text-accent-bright",
        label: "Привычки сегодня",
        value: `${ratio.done} / ${ratio.total}`,
      },
      {
        icon: Scale,
        color: "text-cyan-bright",
        label: "Вес от старта",
        value: wDelta === 0 ? "± 0 кг" : `${wDelta > 0 ? "+" : ""}${wDelta} кг`,
      },
      {
        icon: Zap,
        color: "text-ok-bright",
        label: "Задачи сегодня",
        value: `${doneToday} закрыто`,
      },
      {
        icon: Target,
        color: "text-violet-bright",
        label: "Открыто всего",
        value: `${open} задач`,
      },
    ];

    return out;
  }, [tasks, habits, habitLogs, kgis]);

  return (
    <div className="panel rounded-lg p-4 md:p-5">
      <div className="mb-3 font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
        ◆ Сводка
      </div>
      <ul className="space-y-2.5">
        {rows.map((r) => (
          <li key={r.label} className="flex items-center gap-3">
            <div
              className={cn(
                "flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-surface-2",
                r.color
              )}
            >
              <r.icon className="h-3.5 w-3.5" strokeWidth={2.2} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-mono text-[9px] uppercase tracking-wider text-muted">
                {r.label}
              </div>
              <div className="num text-sm text-foreground truncate">
                {r.value}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
