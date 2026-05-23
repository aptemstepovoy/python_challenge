"use client";

import { useStore } from "@/lib/store";
import {
  dailyHabits,
  weeklyHabits,
  logForToday,
  todayCompletionRatio,
} from "@/lib/habits-logic";
import { HabitDailyCard, HabitWeeklyCard } from "@/components/HabitCard";
import { HabitHeatmap } from "@/components/HabitHeatmap";
import { Progress } from "@/components/ui/progress";
import { Sparkles } from "lucide-react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

export default function HabitsPage() {
  const habits = useStore((s) => s.habits);
  const habitLogs = useStore((s) => s.habitLogs);

  const today = new Date();
  const todayISO = today.toISOString().slice(0, 10);
  const daily = dailyHabits(habits, today);
  const weekly = weeklyHabits(habits, today);
  const ratio = todayCompletionRatio(habits, habitLogs, today);
  const archived = habits.filter((h) => h.archived);
  const allDailyDone = ratio.total > 0 && ratio.done === ratio.total;

  return (
    <div className="p-4 space-y-6 md:p-10 md:space-y-8">
      <header className="border-b border-border pb-5 md:pb-6">
        <h1 className="font-mono text-xl tracking-wider text-foreground md:text-2xl">
          Привычки
        </h1>
        <p className="mt-1 text-sm text-muted">
          Ежедневные действия которые двигают к целям
        </p>
      </header>

      <section className="space-y-3">
        <div className="flex items-baseline justify-between">
          <div className="font-mono text-[11px] uppercase tracking-[0.15em] text-muted">
            Сегодня · {format(today, "EEEE, d MMM", { locale: ru })}
          </div>
          <span className="num text-xs text-foreground">
            {ratio.done} / {ratio.total}
          </span>
        </div>
        <Progress
          value={ratio.total ? (ratio.done / ratio.total) * 100 : 0}
          tone={allDailyDone ? "ok" : "accent"}
        />

        {allDailyDone && (
          <div className="flex items-center gap-3 rounded border border-ok/40 bg-ok/5 p-4">
            <Sparkles className="h-5 w-5 text-ok" />
            <div className="flex-1">
              <div className="font-mono text-xs uppercase tracking-wider text-ok">
                Всё на сегодня
              </div>
              <div className="text-sm text-foreground">
                Готовься к завтра — открой Tasks и фокусируйся на главном.
              </div>
            </div>
          </div>
        )}

        <div className="space-y-2">
          {daily.map((h) => (
            <HabitDailyCard key={h.id} habit={h} />
          ))}
        </div>
      </section>

      {weekly.length > 0 && (
        <section className="space-y-3">
          <div className="font-mono text-[11px] uppercase tracking-[0.15em] text-muted">
            На неделе
          </div>
          <div className="space-y-2">
            {weekly.map((h) => (
              <HabitWeeklyCard key={h.id} habit={h} />
            ))}
          </div>
        </section>
      )}

      <section>
        <HabitHeatmap />
      </section>

      {archived.length > 0 && (
        <section className="space-y-2">
          <div className="font-mono text-[11px] uppercase tracking-[0.15em] text-muted">
            Архив
          </div>
          <ul className="space-y-1.5">
            {archived.map((h) => (
              <li
                key={h.id}
                className="flex items-center justify-between rounded border border-border bg-surface px-4 py-2 text-sm text-muted"
              >
                <span>{h.name}</span>
                <span className="font-mono text-[10px] uppercase tracking-wider">
                  {h.active_until
                    ? `до ${h.active_until}`
                    : "архивирована"}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
