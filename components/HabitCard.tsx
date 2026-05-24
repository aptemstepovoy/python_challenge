"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useStore } from "@/lib/store";
import { logForToday, logsInWeek, habitStreak } from "@/lib/habits-logic";
import { Icon } from "@/components/Icon";
import { haptic } from "@/lib/haptics";
import { playHabitDone } from "@/lib/sound";
import { cn } from "@/lib/utils";
import { Flame, Check } from "lucide-react";
import type { Habit } from "@/lib/types";
import { format } from "date-fns";

const BURST_ANGLES = [0, 60, 120, 180, 240, 300];

function Burst({ color }: { color: string }) {
  return (
    <div className="pointer-events-none absolute inset-0">
      {BURST_ANGLES.map((angle, i) => {
        const rad = (angle * Math.PI) / 180;
        return (
          <motion.span
            key={i}
            initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
            animate={{
              x: Math.cos(rad) * 45,
              y: Math.sin(rad) * 45,
              opacity: 0,
              scale: 0.3,
            }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="absolute left-6 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full"
            style={{
              background: color,
              boxShadow: `0 0 12px ${color}`,
            }}
          />
        );
      })}
      <motion.span
        initial={{ scale: 0, opacity: 0.7 }}
        animate={{ scale: 2.5, opacity: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="absolute left-6 top-1/2 h-8 w-8 -translate-y-1/2 -translate-x-1/2 rounded-full"
        style={{
          background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
        }}
      />
    </div>
  );
}

export function HabitDailyCard({ habit }: { habit: Habit }) {
  const habitLogs = useStore((s) => s.habitLogs);
  const toggle = useStore((s) => s.toggleHabit);
  const [celebrating, setCelebrating] = useState(false);

  const today = new Date();
  const todayISO = today.toISOString().slice(0, 10);
  const log = logForToday(habitLogs, habit.id, todayISO);
  const done = !!log;
  const streak = habitStreak(habitLogs, habit.id, today);

  const onTap = () => {
    if (done) {
      haptic("tap");
      toggle(habit.id);
      return;
    }
    haptic("success");
    playHabitDone();
    setCelebrating(true);
    setTimeout(() => {
      toggle(habit.id);
      setCelebrating(false);
    }, 450);
  };

  const completedAt = log
    ? format(new Date(log.completed_at), "HH:mm")
    : null;

  return (
    <button
      onClick={onTap}
      className={cn(
        "relative w-full overflow-hidden flex items-center gap-4 rounded border p-4 text-left transition-all active:scale-[0.98]",
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
            ? { background: habit.color, color: "#0a0814" }
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
            done ? "text-secondary line-through" : "text-foreground"
          )}
        >
          {habit.name}
        </div>
        <div className="mt-0.5 text-[11px] text-secondary truncate">
          {done && completedAt
            ? `Сделано в ${completedAt}`
            : habit.description}
        </div>
      </div>

      <div className="flex shrink-0 flex-col items-end gap-0.5">
        <div className="font-mono text-[10px] uppercase tracking-wider text-secondary">
          +{habit.xp_per_completion} XP
        </div>
        {streak > 0 && (
          <div className="flex items-center gap-1">
            <Flame className="h-3 w-3 text-accent-bright" />
            <span className="num text-[11px] text-foreground">{streak}</span>
          </div>
        )}
      </div>
      {celebrating && <Burst color={habit.color} />}
    </button>
  );
}

export function HabitWeeklyCard({ habit }: { habit: Habit }) {
  const habitLogs = useStore((s) => s.habitLogs);
  const toggle = useStore((s) => s.toggleHabit);
  const [celebrating, setCelebrating] = useState(false);

  const week = logsInWeek(habitLogs, habit.id);
  const done = week.length;
  const target =
    habit.frequency === "custom_days"
      ? habit.days_of_week?.length ?? 1
      : habit.target_per_week;
  const targetHit = done >= target;

  const onTap = () => {
    haptic("success");
    playHabitDone();
    setCelebrating(true);
    setTimeout(() => {
      toggle(habit.id);
      setCelebrating(false);
    }, 450);
  };

  return (
    <button
      onClick={onTap}
      className={cn(
        "relative w-full overflow-hidden flex items-center gap-4 rounded border border-border bg-surface p-4 text-left transition-all active:scale-[0.98] hover:border-accent-dim",
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
                  background: i < done ? habit.color : "#2d2845",
                }}
              />
            ))}
          </div>
          <span className="num text-[11px] text-secondary">
            {done}/{target}
          </span>
        </div>
      </div>

      <div className="shrink-0 font-mono text-[10px] uppercase tracking-wider text-secondary">
        +{habit.xp_per_completion} XP
      </div>
      {celebrating && <Burst color={habit.color} />}
    </button>
  );
}
