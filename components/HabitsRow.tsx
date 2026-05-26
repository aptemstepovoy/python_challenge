"use client";

import Link from "next/link";
import { Check } from "lucide-react";
import { useStore } from "@/lib/store";
import {
  dailyHabits,
  logForToday,
  todayCompletionRatio,
  visibleTodayHabits,
} from "@/lib/habits-logic";
import { Icon } from "@/components/Icon";
import { haptic } from "@/lib/haptics";
import { cn } from "@/lib/utils";

export function HabitsRow() {
  const habits = useStore((s) => s.habits);
  const habitLogs = useStore((s) => s.habitLogs);
  const toggleHabit = useStore((s) => s.toggleHabit);

  const today = new Date();
  const todayISO = today.toISOString().slice(0, 10);

  const dailies = dailyHabits(habits, today);
  const otherVisible = visibleTodayHabits(habits, habitLogs, today).filter(
    (h) => h.frequency !== "daily"
  );
  const all = [...dailies, ...otherVisible];

  const ratio = todayCompletionRatio(habits, habitLogs, today);
  if (all.length === 0) return null;

  return (
    <section className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="text-[11px] uppercase tracking-wider text-secondary">
          Привычки
        </div>
        <div className="flex items-baseline gap-3 text-[11px] num">
          <span>
            <span className="text-foreground">{ratio.done}</span>
            <span className="text-muted"> / {ratio.total}</span>
          </span>
          <Link
            href="/habits"
            className="text-muted hover:text-accent-bright transition-colors"
          >
            все →
          </Link>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {all.map((h) => {
          const done = !!logForToday(habitLogs, h.id, todayISO);
          return (
            <button
              key={h.id}
              onClick={() => {
                haptic("success");
                toggleHabit(h.id);
              }}
              className={cn(
                "flex items-center gap-2 rounded-full border px-3 py-1.5 text-[13px] transition-colors",
                done
                  ? "border-transparent text-background"
                  : "bg-surface text-foreground hover:border-accent-dim"
              )}
              style={
                done
                  ? { background: h.color, borderColor: h.color }
                  : { borderColor: h.color + "80" }
              }
              title={h.description || h.name}
              aria-pressed={done}
            >
              {done ? (
                <Check className="h-3.5 w-3.5 shrink-0" strokeWidth={3} />
              ) : (
                <Icon
                  name={h.icon}
                  className="h-3.5 w-3.5 shrink-0"
                  style={{ color: h.color }}
                />
              )}
              <span className="whitespace-nowrap">{h.name}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
