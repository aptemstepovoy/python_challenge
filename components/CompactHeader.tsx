"use client";

import { useMemo } from "react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { Flame } from "lucide-react";
import { useStore } from "@/lib/store";
import { perfectDaysStreak } from "@/lib/habits-logic";
import { daysSinceAccountStart } from "@/lib/utils";

const todayISO = () => new Date().toISOString().slice(0, 10);

function greeting(hour: number): string {
  if (hour < 5) return "Доброй ночи";
  if (hour < 12) return "Доброе утро";
  if (hour < 18) return "Добрый день";
  return "Добрый вечер";
}

export function CompactHeader({
  now,
  onOpenRitual,
}: {
  now: Date;
  onOpenRitual: () => void;
}) {
  const tasks = useStore((s) => s.tasks);
  const habits = useStore((s) => s.habits);
  const habitLogs = useStore((s) => s.habitLogs);
  const accountStartDate = useStore((s) => s.accountStartDate);
  const dailyPlans = useStore((s) => s.dailyPlans);

  const today = todayISO();
  const plan = dailyPlans.find((p) => p.date === today);
  const streak = useMemo(
    () => perfectDaysStreak(habits, habitLogs, now),
    [habits, habitLogs, now]
  );
  const doneToday = useMemo(
    () =>
      tasks.filter(
        (t) => t.status === "done" && t.completed_at?.startsWith(today)
      ).length,
    [tasks, today]
  );

  return (
    <header className="space-y-2">
      <div className="flex items-baseline justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[11px] text-muted tracking-wide">
            {format(now, "EEEE, d MMMM", { locale: ru })}
          </div>
          <h1 className="mt-0.5 text-2xl font-semibold text-foreground md:text-3xl">
            {greeting(now.getHours())}
          </h1>
        </div>
        <div className="shrink-0 text-right text-[11px] text-muted num">
          день{" "}
          <span className="text-foreground">
            {daysSinceAccountStart(accountStartDate, now)}
          </span>{" "}
          / 365
        </div>
      </div>

      {plan?.intent && (
        <div className="text-sm text-accent-bright">{plan.intent}</div>
      )}

      {!plan && (
        <button
          onClick={onOpenRitual}
          className="text-sm text-secondary hover:text-foreground transition-colors"
        >
          Выбрать задачи на день →
        </button>
      )}

      <div className="flex items-center gap-4 text-[12px] num text-secondary">
        <span className="flex items-center gap-1.5">
          <Flame className="h-3.5 w-3.5 text-pink-bright" />
          <span className="text-foreground">{streak}</span>
          <span className="text-muted">streak</span>
        </span>
        <span className="text-muted/40">·</span>
        <span>
          <span className="text-foreground">{doneToday}</span>{" "}
          <span className="text-muted">закрыто</span>
        </span>
      </div>
    </header>
  );
}
