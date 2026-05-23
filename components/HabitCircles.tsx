"use client";

import Link from "next/link";
import { useStore } from "@/lib/store";
import {
  dailyHabits,
  logForToday,
  todayCompletionRatio,
} from "@/lib/habits-logic";
import { Icon } from "@/components/Icon";
import { haptic } from "@/lib/haptics";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function HabitCircles() {
  const habits = useStore((s) => s.habits);
  const habitLogs = useStore((s) => s.habitLogs);
  const toggle = useStore((s) => s.toggleHabit);

  const today = new Date();
  const todayISO = today.toISOString().slice(0, 10);
  const daily = dailyHabits(habits, today);
  const ratio = todayCompletionRatio(habits, habitLogs, today);

  return (
    <section>
      <div className="mb-3 flex items-baseline justify-between">
        <div className="font-mono text-[11px] uppercase tracking-[0.15em] text-muted">
          Привычки
        </div>
        <div className="flex items-center gap-3">
          <span className="num text-xs text-foreground">
            {ratio.done} / {ratio.total}
          </span>
          <Link
            href="/habits"
            className="flex items-center gap-1 font-mono text-[10px] uppercase tracking-wider text-accent"
          >
            все <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        {daily.map((h) => {
          const log = logForToday(habitLogs, h.id, todayISO);
          const done = !!log;
          return (
            <button
              key={h.id}
              aria-label={h.name}
              onClick={() => {
                haptic(done ? "tap" : "success");
                toggle(h.id);
              }}
              className={cn(
                "group flex h-16 w-16 flex-col items-center justify-center rounded-full border-2 transition-all active:scale-90",
                done ? "border-transparent" : "border-border"
              )}
              style={
                done
                  ? { background: h.color, color: "#0a0a0a" }
                  : { color: h.color }
              }
            >
              <Icon
                name={h.icon}
                className="h-5 w-5"
                strokeWidth={done ? 2.5 : 2}
              />
              <span
                className={cn(
                  "mt-0.5 font-mono text-[8px] uppercase tracking-wider",
                  done ? "text-background/80" : "text-muted"
                )}
              >
                {h.name.length > 8 ? h.name.slice(0, 7) + "…" : h.name}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
