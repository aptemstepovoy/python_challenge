"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { pickTodayTask, snoozesLeft } from "@/lib/today-logic";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Play, Sparkles, ListPlus } from "lucide-react";
import { haptic } from "@/lib/haptics";
import {
  cn,
  deadlineCategory,
  formatDateRu,
} from "@/lib/utils";

export function MainTaskCard({ compact = false }: { compact?: boolean }) {
  const router = useRouter();
  const tasks = useStore((s) => s.tasks);
  const startTask = useStore((s) => s.startTask);
  const completeTask = useStore((s) => s.completeTask);
  const snoozeTask = useStore((s) => s.snoozeTask);
  const startTimer = useStore((s) => s.startTimer);
  const stopTimer = useStore((s) => s.stopTimer);
  const snoozesUsedDate = useStore((s) => s.snoozesUsedDate);
  const snoozesUsedCount = useStore((s) => s.snoozesUsedCount);

  const today = new Date();
  const task = useMemo(() => pickTodayTask(tasks, today), [tasks, today]);
  const snoozeBudget = snoozesLeft(snoozesUsedDate, snoozesUsedCount, today);

  const [justDone, setJustDone] = useState(false);
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    const key = "operator-pulse-day";
    const todayISO = today.toISOString().slice(0, 10);
    if (typeof window !== "undefined") {
      const last = localStorage.getItem(key);
      if (last !== todayISO) {
        setPulse(true);
        const t = setTimeout(() => {
          setPulse(false);
          localStorage.setItem(key, todayISO);
        }, 1800);
        return () => clearTimeout(t);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!task) {
    return (
      <div className="panel-bright corners rounded-md p-4 md:p-5 h-full flex flex-col items-center justify-center text-center gap-3">
        <Sparkles className="h-6 w-6 text-accent-bright" />
        <div className="display text-lg text-accent-bright leading-tight">
          На сегодня задач нет
        </div>
        <p className="text-sm text-secondary px-2 leading-snug">
          Но ты можешь взять задачу сам
        </p>
        <Button
          size="sm"
          onClick={() => {
            haptic("tap");
            router.push("/tasks");
          }}
        >
          <ListPlus className="mr-1.5 h-3.5 w-3.5" />
          Взять задачу
        </Button>
      </div>
    );
  }

  if (justDone) {
    return (
      <div className="panel-bright corners rounded-md p-4 md:p-5 h-full flex flex-col items-center justify-center gap-2 text-center border-ok/40">
        <Sparkles className="h-7 w-7 text-ok" />
        <div className="display text-xl text-ok">+{task.xp ?? 25} XP</div>
        <div className="text-xs text-secondary">подтягиваю следующую…</div>
      </div>
    );
  }

  const cat = deadlineCategory(task.deadline, today);
  const catLabel =
    cat === "overdue" ? "Просрочено"
    : cat === "week" ? "Эта неделя"
    : cat === "month" ? "Этот месяц"
    : "Позже";
  const catTone: "danger" | "warn" | "accent" | "neutral" =
    cat === "overdue" ? "danger"
    : cat === "week" ? "warn"
    : cat === "month" ? "accent"
    : "neutral";

  const onStart = () => {
    haptic("tap");
    startTask(task.id);
    startTimer(task.id);
  };
  const onDone = () => {
    haptic("success");
    stopTimer();
    completeTask(task.id);
    setJustDone(true);
    setTimeout(() => setJustDone(false), 900);
  };
  const onSnooze = () => {
    if (snoozeBudget <= 0) return;
    haptic("warn");
    snoozeTask(task.id);
  };

  const started = task.status === "in_progress";

  return (
    <div className="panel-bright corners rounded-md p-3 md:p-4 h-full flex flex-col">
      <div className="mb-2 flex items-center justify-between">
        <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-accent-bright">
          ◆ Делай сейчас
        </div>
        <Badge tone={catTone}>{catLabel}</Badge>
      </div>

      <div className="num text-[10px] uppercase tracking-wider text-secondary">
        {task.id}{task.linked_boss ? ` · ${task.linked_boss}` : ""}
      </div>

      <h2 className={cn(
        "leading-tight text-foreground mt-1",
        compact ? "text-lg md:text-xl" : "text-xl md:text-2xl"
      )}>
        {task.title}
      </h2>

      {task.result_definition && !compact && (
        <p className="mt-2 text-xs leading-snug text-secondary line-clamp-2">
          {task.result_definition}
        </p>
      )}

      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[10px] uppercase tracking-wider text-secondary">
        <span>
          до <span className="num text-foreground/80">{formatDateRu(task.deadline)}</span>
        </span>
        <span>
          +<span className="num text-accent-bright">{task.xp ?? 25}</span> XP
        </span>
        {started && <span className="text-ok">в работе</span>}
      </div>

      <div className="mt-auto pt-3 space-y-2">
        <div className="flex flex-col gap-2 lg:flex-row">
          <Button
            onClick={onStart}
            variant="outline"
            size="sm"
            className={cn("w-full lg:flex-1", pulse && !started && "animate-pulse-glow")}
            disabled={started}
          >
            <Play className="mr-1.5 h-3.5 w-3.5" />
            {started ? "В работе" : "Начать"}
          </Button>
          <Button onClick={onDone} size="sm" className="w-full lg:flex-1">
            <Check className="mr-1.5 h-3.5 w-3.5" />
            Сделано
          </Button>
        </div>
        <button
          onClick={onSnooze}
          disabled={snoozeBudget <= 0}
          className={cn(
            "w-full text-center font-mono text-[10px] uppercase tracking-wider transition-colors",
            snoozeBudget > 0
              ? "text-secondary hover:text-pink-bright"
              : "text-secondary/40"
          )}
        >
          {snoozeBudget > 0
            ? `Не сегодня → (${snoozeBudget}/3)`
            : "Снуз исчерпан"}
        </button>
      </div>
    </div>
  );
}
