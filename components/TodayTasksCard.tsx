"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check,
  ChevronRight,
  ListPlus,
  Play,
  Sparkles,
  Clock,
  AlertTriangle,
} from "lucide-react";
import { useStore } from "@/lib/store";
import { pickTodayTasks, snoozesLeft } from "@/lib/today-logic";
import { haptic } from "@/lib/haptics";
import { cn, formatDateRu } from "@/lib/utils";
import { differenceInCalendarDays, parseISO } from "date-fns";
import type { Task } from "@/lib/types";

function classify(task: Task, today: Date) {
  const todayISO = today.toISOString().slice(0, 10);
  if (task.deadline < todayISO) {
    const days = differenceInCalendarDays(today, parseISO(task.deadline));
    return {
      kind: "overdue" as const,
      label: `Просрочено · ${days} дн.`,
      tone: "danger" as const,
    };
  }
  if (task.deadline === todayISO) {
    return {
      kind: "due" as const,
      label: "Дедлайн сегодня",
      tone: "warn" as const,
    };
  }
  const days = differenceInCalendarDays(parseISO(task.deadline), today);
  return {
    kind: "future" as const,
    label: `до ${formatDateRu(task.deadline)} · ${days} дн.`,
    tone: "accent" as const,
  };
}

function TaskRow({ task }: { task: Task }) {
  const today = useMemo(() => new Date(), []);
  const startTask = useStore((s) => s.startTask);
  const completeTask = useStore((s) => s.completeTask);
  const startTimer = useStore((s) => s.startTimer);
  const stopTimer = useStore((s) => s.stopTimer);
  const snoozeTask = useStore((s) => s.snoozeTask);
  const snoozesUsedDate = useStore((s) => s.snoozesUsedDate);
  const snoozesUsedCount = useStore((s) => s.snoozesUsedCount);

  const [expanded, setExpanded] = useState(false);
  const [busy, setBusy] = useState(false);
  const cat = classify(task, today);
  const started = task.status === "in_progress";
  const snoozeBudget = snoozesLeft(snoozesUsedDate, snoozesUsedCount, today);

  const onStart = (e: React.MouseEvent) => {
    e.stopPropagation();
    haptic("tap");
    startTask(task.id);
    startTimer(task.id);
  };
  const onDone = (e: React.MouseEvent) => {
    e.stopPropagation();
    haptic("success");
    stopTimer();
    setBusy(true);
    completeTask(task.id);
  };
  const onSnooze = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (snoozeBudget <= 0) return;
    haptic("warn");
    snoozeTask(task.id);
  };

  const borderTone =
    cat.kind === "overdue"
      ? "border-danger/60 bg-danger/5"
      : started
      ? "border-accent/60 bg-accent/5"
      : cat.kind === "due"
      ? "border-warn/40 bg-warn/5"
      : "border-border bg-surface";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: busy ? 0 : 1, y: 0 }}
      exit={{ opacity: 0, x: 40 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "rounded-md border transition-colors overflow-hidden",
        borderTone
      )}
    >
      <button
        onClick={() => {
          haptic("tap");
          setExpanded((v) => !v);
        }}
        className="w-full text-left px-3 py-2.5 flex items-center gap-2.5"
      >
        <span className="num shrink-0 text-[10px] text-muted">{task.id}</span>
        <span className="flex-1 min-w-0">
          <span
            className={cn(
              "block text-sm truncate",
              cat.kind === "overdue"
                ? "text-danger-bright"
                : "text-foreground"
            )}
          >
            {task.title}
          </span>
          <span
            className={cn(
              "flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider mt-0.5",
              cat.kind === "overdue"
                ? "text-danger-bright"
                : cat.kind === "due"
                ? "text-warn"
                : "text-secondary"
            )}
          >
            {cat.kind === "overdue" && (
              <AlertTriangle className="h-3 w-3" strokeWidth={2.5} />
            )}
            {cat.kind === "due" && <Clock className="h-3 w-3" />}
            {cat.label}
            <span className="text-accent-bright">
              · +{task.xp ?? 25} XP
            </span>
            {started && <span className="text-ok">· в работе</span>}
          </span>
        </span>
        <ChevronRight
          className={cn(
            "h-4 w-4 shrink-0 text-secondary transition-transform",
            expanded && "rotate-90"
          )}
        />
      </button>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18 }}
          >
            <div className="px-3 pb-2.5 pt-1 space-y-2">
              {task.result_definition && (
                <p className="text-xs leading-snug text-secondary">
                  {task.result_definition}
                </p>
              )}
              <div className="flex flex-col gap-1.5 sm:flex-row">
                <button
                  onClick={onStart}
                  disabled={started}
                  className={cn(
                    "flex-1 rounded-md border px-2.5 py-1.5 text-xs font-mono uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors",
                    started
                      ? "border-border bg-surface-2 text-muted"
                      : "border-accent-dim bg-surface-2 text-foreground hover:border-accent"
                  )}
                >
                  <Play className="h-3 w-3" />
                  {started ? "В работе" : "Начать"}
                </button>
                <button
                  onClick={onDone}
                  className="flex-1 rounded-md border border-accent bg-accent/20 px-2.5 py-1.5 text-xs font-mono uppercase tracking-wider text-accent-bright hover:bg-accent/30 flex items-center justify-center gap-1.5"
                >
                  <Check className="h-3 w-3" />
                  Сделано
                </button>
                <button
                  onClick={onSnooze}
                  disabled={snoozeBudget <= 0}
                  className={cn(
                    "rounded-md border px-2.5 py-1.5 text-xs font-mono uppercase tracking-wider transition-colors",
                    snoozeBudget > 0
                      ? "border-border bg-surface text-secondary hover:text-pink-bright hover:border-pink/40"
                      : "border-border bg-surface text-muted cursor-not-allowed"
                  )}
                >
                  Не сегодня ({snoozeBudget})
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function TodayTasksCard() {
  const router = useRouter();
  const tasks = useStore((s) => s.tasks);
  const today = useMemo(() => new Date(), []);
  const list = useMemo(() => pickTodayTasks(tasks, today), [tasks, today]);

  const overdue = list.filter((t) => {
    const todayISO = today.toISOString().slice(0, 10);
    return t.deadline < todayISO;
  });

  if (list.length === 0) {
    return (
      <div className="panel-bright corners rounded-md p-4 md:p-5 h-full flex flex-col items-center justify-center text-center gap-3">
        <Sparkles className="h-6 w-6 text-accent-bright" />
        <div className="display text-lg text-accent-bright leading-tight">
          На сегодня задач нет
        </div>
        <p className="text-sm text-secondary px-2 leading-snug">
          Но ты можешь взять задачу сам
        </p>
        <button
          onClick={() => {
            haptic("tap");
            router.push("/tasks");
          }}
          className="rounded-md border border-accent bg-accent/20 px-3 py-1.5 text-xs font-mono uppercase tracking-wider text-accent-bright hover:bg-accent/30 flex items-center gap-1.5"
        >
          <ListPlus className="h-3 w-3" />
          Взять задачу
        </button>
      </div>
    );
  }

  return (
    <div className="panel-bright corners rounded-md p-3 md:p-4 h-full flex flex-col">
      <div className="mb-2.5 flex items-center justify-between">
        <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-accent-bright">
          ◆ Задачи на сегодня
        </div>
        <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider">
          {overdue.length > 0 && (
            <span className="text-danger-bright num">
              {overdue.length} просроч.
            </span>
          )}
          <span className="text-secondary num">всего {list.length}</span>
        </div>
      </div>

      <div className="space-y-1.5 flex-1 overflow-y-auto">
        <AnimatePresence>
          {list.map((t) => (
            <TaskRow key={t.id} task={t} />
          ))}
        </AnimatePresence>
      </div>

      <button
        onClick={() => {
          haptic("tap");
          router.push("/tasks");
        }}
        className="mt-2.5 w-full text-center font-mono text-[10px] uppercase tracking-wider text-secondary hover:text-accent-bright"
      >
        Все задачи →
      </button>
    </div>
  );
}
