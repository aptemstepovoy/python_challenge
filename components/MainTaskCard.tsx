"use client";

import { useEffect, useMemo, useState } from "react";
import { useStore } from "@/lib/store";
import { pickMainTask, snoozesLeft } from "@/lib/today-logic";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Play, Sparkles } from "lucide-react";
import { haptic } from "@/lib/haptics";
import {
  cn,
  deadlineCategory,
  formatDateRu,
} from "@/lib/utils";

export function MainTaskCard() {
  const tasks = useStore((s) => s.tasks);
  const startTask = useStore((s) => s.startTask);
  const completeTask = useStore((s) => s.completeTask);
  const snoozeTask = useStore((s) => s.snoozeTask);
  const snoozesUsedDate = useStore((s) => s.snoozesUsedDate);
  const snoozesUsedCount = useStore((s) => s.snoozesUsedCount);

  const today = new Date();
  const task = useMemo(() => pickMainTask(tasks, today), [tasks, today]);
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
      <div className="rounded-md border border-border bg-surface p-6 md:p-8">
        <div className="mb-3 font-mono text-[11px] uppercase tracking-[0.15em] text-muted">
          Сегодня чисто
        </div>
        <h2 className="text-2xl text-foreground md:text-3xl">
          Всё закрыто. Хорошо.
        </h2>
        <p className="mt-3 text-sm text-muted">
          Можешь подготовиться к завтра — открой Tasks и спланируй приоритеты.
        </p>
      </div>
    );
  }

  if (justDone) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-md border border-ok/40 bg-ok/5 p-10 text-center">
        <Sparkles className="h-8 w-8 text-ok" />
        <div className="font-mono text-sm uppercase tracking-wider text-ok">
          +{task.xp ?? 25} XP
        </div>
        <div className="text-sm text-muted">подтягиваю следующую…</div>
      </div>
    );
  }

  const cat = deadlineCategory(task.deadline, today);
  const catLabel =
    cat === "overdue"
      ? "Просрочено"
      : cat === "week"
        ? "На этой неделе"
        : cat === "month"
          ? "В этом месяце"
          : "Позже";
  const catTone: "danger" | "warn" | "accent" | "neutral" =
    cat === "overdue"
      ? "danger"
      : cat === "week"
        ? "warn"
        : cat === "month"
          ? "accent"
          : "neutral";

  const onStart = () => {
    haptic("tap");
    startTask(task.id);
  };
  const onDone = () => {
    haptic("success");
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
    <div className="rounded-md border border-border bg-surface p-6 md:p-8">
      <div className="mb-4 flex items-center justify-between">
        <div className="font-mono text-[11px] uppercase tracking-[0.15em] text-muted">
          Сейчас делай это
        </div>
        <Badge tone={catTone}>{catLabel}</Badge>
      </div>

      <div className="mb-2 num text-[10px] uppercase tracking-wider text-muted">
        {task.id}
        {task.linked_boss && (
          <>
            {" · "}
            <span className="text-accent/80">босс {task.linked_boss}</span>
          </>
        )}
      </div>

      <h2 className="text-2xl leading-tight text-foreground md:text-3xl">
        {task.title}
      </h2>

      {task.result_definition && (
        <p className="mt-3 text-sm leading-relaxed text-muted md:text-base">
          {task.result_definition}
        </p>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-[11px] uppercase tracking-wider text-muted">
        <span>
          до <span className="num text-foreground/80">{formatDateRu(task.deadline)}</span>
        </span>
        <span>
          +<span className="num text-accent">{task.xp ?? 25}</span> XP
        </span>
        {started && (
          <span className="text-ok">в работе</span>
        )}
      </div>

      <div className="mt-6 flex flex-col gap-2 md:flex-row">
        <Button
          onClick={onStart}
          variant={started ? "outline" : "outline"}
          className={cn(
            "w-full md:flex-1",
            pulse && !started && "animate-pulse"
          )}
          disabled={started}
        >
          <Play className="mr-2 h-4 w-4" />
          {started ? "Уже в работе" : "Начать"}
        </Button>
        <Button onClick={onDone} className="w-full md:flex-1">
          <Check className="mr-2 h-4 w-4" />
          Сделано
        </Button>
      </div>

      <button
        onClick={onSnooze}
        disabled={snoozeBudget <= 0}
        className={cn(
          "mt-4 w-full text-center font-mono text-[11px] uppercase tracking-wider transition-colors",
          snoozeBudget > 0
            ? "text-muted hover:text-foreground"
            : "text-muted/50 cursor-not-allowed"
        )}
      >
        {snoozeBudget > 0
          ? `Не сегодня → (осталось ${snoozeBudget} из 3)`
          : "Снуз исчерпан. Сделай сегодня."}
      </button>
    </div>
  );
}
