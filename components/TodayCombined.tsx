"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useStore } from "@/lib/store";
import {
  dailyHabits,
  logForToday,
  todayCompletionRatio,
} from "@/lib/habits-logic";
import { Icon } from "@/components/Icon";
import { Checkbox } from "@/components/ui/checkbox";
import { haptic } from "@/lib/haptics";
import { cn, deadlineCategory } from "@/lib/utils";
import { ArrowRight } from "lucide-react";

export function TodayCombined() {
  const tasks = useStore((s) => s.tasks);
  const habits = useStore((s) => s.habits);
  const habitLogs = useStore((s) => s.habitLogs);
  const toggleHabit = useStore((s) => s.toggleHabit);
  const completeTask = useStore((s) => s.completeTask);
  const cycle = useStore((s) => s.cycleTaskStatus);

  const today = new Date();
  const todayISO = today.toISOString().slice(0, 10);
  const daily = dailyHabits(habits, today);
  const ratio = todayCompletionRatio(habits, habitLogs, today);

  const taskList = useMemo(() => {
    const todayISO = today.toISOString().slice(0, 10);
    const open = tasks.filter((t) => t.status !== "done");
    const overdue = open.filter((t) => t.deadline < todayISO);
    const due = open.filter((t) => t.deadline === todayISO);
    const inProgress = open.filter(
      (t) => t.status === "in_progress" && !overdue.includes(t) && !due.includes(t)
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
        <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted">
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
        <div className="grid grid-cols-5 gap-1.5">
          {daily.map((h) => {
            const done = !!logForToday(habitLogs, h.id, todayISO);
            return (
              <button
                key={h.id}
                onClick={() => {
                  haptic(done ? "tap" : "success");
                  toggleHabit(h.id);
                }}
                aria-label={h.name}
                className="flex flex-col items-center gap-1 active:scale-90 transition-transform"
              >
                <span
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full border-2"
                  )}
                  style={{
                    background: done ? h.color : "transparent",
                    borderColor: done ? "transparent" : `${h.color}80`,
                    color: done ? "#0a0814" : h.color,
                  }}
                >
                  <Icon name={h.icon} className="h-3.5 w-3.5" strokeWidth={done ? 2.5 : 2} />
                </span>
                <span
                  className={cn(
                    "text-[10px] leading-tight text-center truncate w-full",
                    done ? "text-accent-bright" : "text-secondary"
                  )}
                >
                  {h.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex-1 space-y-1.5 overflow-y-auto">
        <div className="font-mono text-[10px] uppercase tracking-wider text-muted">
          задачи
        </div>
        {taskList.length === 0 ? (
          <div className="py-3 text-center text-sm text-muted">
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
                    done && "text-muted line-through"
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
