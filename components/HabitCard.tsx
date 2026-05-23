"use client";

import { useStore } from "@/lib/store";
import { logForToday, logsInWeek, habitStreak } from "@/lib/habits-logic";
import { Icon } from "@/components/Icon";
import { haptic } from "@/lib/haptics";
import { cn } from "@/lib/utils";
import { Flame, Check } from "lucide-react";
import type { Habit } from "@/lib/types";
import { format } from "date-fns";

export function HabitDailyCard({ habit }: { habit: Habit }) {
  const habitLogs = useStore((s) => s.habitLogs);
  const toggle = useStore((s) => s.toggleHabit);

  const today = new Date();
  const todayISO = today.toISOString().slice(0, 10);
  const log = logForToday(habitLogs, habit.id, todayISO);
  const done = !!log;
  const streak = habitStreak(habitLogs, habit.id, today);

  const onTap = () => {
    haptic(done ? "tap" : "success");
    toggle(habit.id);
  };

  const completedAt = log
    ? format(new Date(log.completed_at), "HH:mm")
    : null;

  return (
    <button
      onClick={onTap}
      className={cn(
        "flex w-full items-center gap-4 rounded border p-4 text-left transition-all active:scale-[0.98]",
        done
          ? "border-border bg-surface-2/50"
          : "border-border bg-surface hover:border-accent-dim"
      )}
    >
      <div
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
          done ? "bg-transparent" : ""
        )}
        style={
          done
            ? { background: habit.color, color: "#0a0a0a" }
            : { color: habit.color, border: `2px solid ${habit.color}40` }
        }
      >
        {done ? (
          <Check className="h-5 w-5" strokeWidth={3} />
        ) : (
          <Icon name={habit.icon} className="h-5 w-5" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div
          className={cn(
            "text-sm",
            done ? "text-muted line-through" : "text-foreground"
          )}
        >
          {habit.name}
        </div>
        <div className="mt-0.5 text-[11px] text-muted truncate">
          {done && completedAt
            ? `Сделано в ${completedAt}`
            : habit.description}
        </div>
      </div>

      <div className="flex shrink-0 flex-col items-end gap-0.5">
        <div className="font-mono text-[10px] uppercase tracking-wider text-muted">
          +{habit.xp_per_completion} XP
        </div>
        {streak > 0 && (
          <div className="flex items-center gap-1">
            <Flame className="h-3 w-3 text-accent" />
            <span className="num text-[11px] text-foreground">{streak}</span>
          </div>
        )}
      </div>
    </button>
  );
}

export function HabitWeeklyCard({ habit }: { habit: Habit }) {
  const habitLogs = useStore((s) => s.habitLogs);
  const toggle = useStore((s) => s.toggleHabit);

  const week = logsInWeek(habitLogs, habit.id);
  const done = week.length;
  const target = habit.target_per_week;
  const pct = Math.min(100, (done / target) * 100);

  const onTap = () => {
    haptic("success");
    toggle(habit.id);
  };

  const targetHit = done >= target;

  return (
    <button
      onClick={onTap}
      className={cn(
        "flex w-full items-center gap-4 rounded border border-border bg-surface p-4 text-left transition-all active:scale-[0.98] hover:border-accent-dim",
        targetHit && "border-ok/40"
      )}
    >
      <div
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
        style={{ color: habit.color, border: `2px solid ${habit.color}40` }}
      >
        <Icon name={habit.icon} className="h-5 w-5" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="text-sm text-foreground">{habit.name}</div>
        <div className="mt-1 flex items-center gap-2">
          <div className="flex gap-0.5">
            {Array.from({ length: target }).map((_, i) => (
              <div
                key={i}
                className="h-1.5 w-3 rounded-sm"
                style={{
                  background: i < done ? habit.color : "#262626",
                }}
              />
            ))}
          </div>
          <span className="num text-[11px] text-muted">
            {done}/{target}
          </span>
        </div>
      </div>

      <div className="shrink-0 font-mono text-[10px] uppercase tracking-wider text-muted">
        +{habit.xp_per_completion} XP
      </div>
    </button>
  );
}
