"use client";

import { useMemo } from "react";
import { useStore } from "@/lib/store";
import {
  dailyHabits,
  logForToday,
} from "@/lib/habits-logic";

const todayISO = () => new Date().toISOString().slice(0, 10);

/**
 * Тонкая sticky-полоса внизу экрана. Прогресс дня =
 * (закрытые committed-задачи + сделанные daily-привычки) / (committed + daily-привычки).
 * Видна даже когда юзер скроллит.
 */
export function DayProgressBar() {
  const tasks = useStore((s) => s.tasks);
  const habits = useStore((s) => s.habits);
  const habitLogs = useStore((s) => s.habitLogs);
  const dailyPlans = useStore((s) => s.dailyPlans);

  const today = todayISO();
  const plan = dailyPlans.find((p) => p.date === today);

  const { done, total } = useMemo(() => {
    const committedIds = plan?.committed_task_ids ?? [];
    let totalCount = 0;
    let doneCount = 0;

    for (const id of committedIds) {
      const t = tasks.find((x) => x.id === id);
      if (!t) continue;
      totalCount += 1;
      if (t.status === "done") doneCount += 1;
    }

    const dailies = dailyHabits(habits);
    for (const h of dailies) {
      totalCount += 1;
      if (logForToday(habitLogs, h.id, today)) doneCount += 1;
    }

    return { done: doneCount, total: totalCount };
  }, [tasks, habits, habitLogs, plan, today]);

  if (total === 0) return null;

  const pct = Math.min(100, Math.round((done / total) * 100));
  const full = pct >= 100;

  return (
    <div
      className="sticky bottom-0 z-30 -mx-3 mt-2 md:-mx-6"
      role="progressbar"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`Прогресс дня ${done} из ${total}`}
    >
      <div className="flex items-center gap-2 bg-background/85 backdrop-blur px-3 py-1.5 md:px-6 border-t border-border">
        <div className="flex-1 h-1.5 overflow-hidden rounded-full bg-surface-2">
          <div
            className="h-full transition-all duration-500"
            style={{
              width: `${pct}%`,
              background: full
                ? "#86efac"
                : "linear-gradient(90deg, #7c5cff, #f25fa9 60%, #39d6f0)",
            }}
          />
        </div>
        <span className="num font-mono text-[10px] uppercase tracking-wider shrink-0">
          <span className={full ? "text-ok-bright" : "text-foreground"}>
            {done}
          </span>
          <span className="text-secondary"> / {total}</span>
        </span>
      </div>
    </div>
  );
}
