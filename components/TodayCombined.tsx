"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useStore } from "@/lib/store";
import {
  logsInWeek,
  todayCompletionRatio,
  visibleTodayHabits,
} from "@/lib/habits-logic";
import { Icon } from "@/components/Icon";
import { Checkbox } from "@/components/ui/checkbox";
import { haptic } from "@/lib/haptics";
import { playHabitDone } from "@/lib/sound";
import { cn, deadlineCategory } from "@/lib/utils";
import { ArrowRight } from "lucide-react";

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
              x: Math.cos(rad) * 38,
              y: Math.sin(rad) * 38,
              opacity: 0,
              scale: 0.3,
            }}
            transition={{ duration: 0.55, ease: "easeOut" }}
            className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{
              background: color,
              boxShadow: `0 0 12px ${color}`,
            }}
          />
        );
      })}
      <motion.span
        initial={{ scale: 0, opacity: 0.8 }}
        animate={{ scale: 2.2, opacity: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="absolute left-1/2 top-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
        }}
      />
    </div>
  );
}

export function TodayCombined() {
  const tasks = useStore((s) => s.tasks);
  const habits = useStore((s) => s.habits);
  const habitLogs = useStore((s) => s.habitLogs);
  const toggleHabit = useStore((s) => s.toggleHabit);
  const completeTask = useStore((s) => s.completeTask);
  const cycle = useStore((s) => s.cycleTaskStatus);

  const today = new Date();

  const visible = useMemo(
    () => visibleTodayHabits(habits, habitLogs, today),
    [habits, habitLogs, today]
  );
  const ratio = todayCompletionRatio(habits, habitLogs, today);

  const [celebrate, setCelebrate] = useState<{ id: string; color: string } | null>(
    null
  );

  const onHabitTap = (h: (typeof visible)[number]) => {
    haptic("success");
    playHabitDone();
    setCelebrate({ id: h.id, color: h.color });
    // wait a moment for the burst before actually toggling so user sees it
    setTimeout(() => {
      toggleHabit(h.id);
      setCelebrate(null);
    }, 450);
  };

  const taskList = useMemo(() => {
    const todayISO = today.toISOString().slice(0, 10);
    const open = tasks.filter((t) => t.status !== "done");
    const overdue = open.filter((t) => t.deadline < todayISO);
    const due = open.filter((t) => t.deadline === todayISO);
    const inProgress = open.filter(
      (t) =>
        t.status === "in_progress" &&
        !overdue.includes(t) &&
        !due.includes(t)
    );
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowISO = tomorrow.toISOString().slice(0, 10);
    const tomorrowTasks = open.filter(
      (t) =>
        t.deadline === tomorrowISO &&
        !overdue.includes(t) &&
        !due.includes(t) &&
        !inProgress.includes(t)
    );
    return [...overdue, ...due, ...inProgress, ...tomorrowTasks].slice(0, 5);
  }, [tasks, today]);

  return (
    <div className="panel rounded-md p-3 md:p-4 h-full flex flex-col">
      <div className="mb-3 flex items-baseline justify-between">
        <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-secondary">
          ◆ Сегодня
        </div>
        <Link
          href="/tasks"
          className="font-mono text-[10px] uppercase tracking-wider text-accent-bright hover:text-pink-bright"
        >
          все →
        </Link>
      </div>

      <div className="mb-3">
        <div className="mb-2 flex items-baseline justify-between">
          <span className="font-mono text-[11px] uppercase tracking-wider text-secondary">
            Привычки
          </span>
          <span className="num text-xs text-foreground">
            {ratio.done} / {ratio.total}
          </span>
        </div>
        <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2 lg:grid-cols-3 min-h-[2.25rem]">
          <AnimatePresence mode="popLayout">
            {visible.map((h) => {
              const isWeekly = h.frequency === "weekly_n";
              const isCustom = h.frequency === "custom_days";
              const weekDone = isWeekly
                ? logsInWeek(habitLogs, h.id, today).length
                : 0;
              const counter = isWeekly
                ? `${weekDone}/${h.target_per_week}`
                : isCustom
                  ? null
                  : null;
              const celebrating = celebrate?.id === h.id;
              return (
                <motion.button
                  key={h.id}
                  layout
                  initial={{ opacity: 1, scale: 1 }}
                  exit={{
                    opacity: 0,
                    scale: 0.7,
                    y: -8,
                    transition: { duration: 0.35, ease: "easeIn" },
                  }}
                  onClick={() => onHabitTap(h)}
                  aria-label={h.name}
                  className={cn(
                    "relative flex items-center gap-2 rounded-md border px-2 py-1.5 text-left transition-colors active:scale-[0.97] overflow-hidden",
                    "border-border bg-surface-2/30 hover:border-accent-dim"
                  )}
                >
                  <span
                    className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2"
                    style={{
                      background: "transparent",
                      borderColor: `${h.color}80`,
                      color: h.color,
                    }}
                  >
                    <Icon
                      name={h.icon}
                      className="h-3 w-3"
                      strokeWidth={2}
                    />
                  </span>
                  <span className="text-xs truncate flex-1 text-foreground">
                    {h.name}
                  </span>
                  {counter && (
                    <span
                      className="num shrink-0 text-[10px] font-mono"
                      style={{ color: h.color }}
                    >
                      {counter}
                    </span>
                  )}
                  {celebrating && <Burst color={h.color} />}
                </motion.button>
              );
            })}
          </AnimatePresence>
          {visible.length === 0 && (
            <div className="col-span-full py-2 text-center text-xs text-secondary">
              Все привычки на сегодня закрыты
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 space-y-1.5 overflow-y-auto">
        <div className="font-mono text-[10px] uppercase tracking-wider text-secondary">
          задачи
        </div>
        {taskList.length === 0 ? (
          <div className="py-3 text-center text-sm text-secondary">
            на сегодня чисто
          </div>
        ) : (
          taskList.map((t) => {
            const cat = deadlineCategory(t.deadline);
            const done = t.status === "done";
            const overdue = cat === "overdue";
            return (
              <div
                key={t.id}
                className={cn(
                  "flex items-center gap-2 rounded border px-2 py-1.5 text-xs transition-colors",
                  t.status === "in_progress"
                    ? "border-accent/40 bg-accent/10"
                    : "border-border bg-surface-2/40 hover:border-accent-dim",
                  overdue && "border-danger/40"
                )}
              >
                <Checkbox
                  checked={done}
                  onCheckedChange={() => {
                    haptic("success");
                    if (done) cycle(t.id);
                    else completeTask(t.id);
                  }}
                />
                <span
                  className={cn(
                    "flex-1 truncate text-foreground",
                    done && "text-secondary line-through"
                  )}
                >
                  {t.title}
                </span>
                <span
                  className={cn(
                    "num text-[10px] shrink-0",
                    overdue ? "text-danger-bright" : "text-accent-bright"
                  )}
                >
                  +{t.xp ?? 25}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
