"use client";

import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useStore } from "@/lib/store";
import { haptic } from "@/lib/haptics";
import {
  cn,
  deadlineCategory,
  formatDateRu,
} from "@/lib/utils";
import { weightTargets } from "@/lib/initial-data";
import { parseISO, differenceInCalendarDays } from "date-fns";
import { ArrowRight, Check } from "lucide-react";
import Link from "next/link";

function planWeightForToday(today: Date = new Date()): number | null {
  let nearest = weightTargets[0];
  let bestDiff = Math.abs(
    differenceInCalendarDays(today, parseISO(nearest.date))
  );
  for (const t of weightTargets) {
    const diff = Math.abs(differenceInCalendarDays(today, parseISO(t.date)));
    if (diff < bestDiff) {
      bestDiff = diff;
      nearest = t;
    }
  }
  return nearest.weight_kg;
}

function FocusTask() {
  const tasks = useStore((s) => s.tasks);
  const cycle = useStore((s) => s.cycleTaskStatus);

  const focus = useMemo(() => {
    const open = tasks.filter((t) => t.status !== "done");
    if (open.length === 0) return null;
    const sorted = open.slice().sort((a, b) => {
      const aP = a.status === "in_progress" ? 0 : 1;
      const bP = b.status === "in_progress" ? 0 : 1;
      if (aP !== bP) return aP - bP;
      return a.deadline.localeCompare(b.deadline);
    });
    return sorted[0];
  }, [tasks]);

  if (!focus) {
    return (
      <Card className="p-5">
        <div className="font-mono text-xs uppercase tracking-wider text-muted">
          Фокус
        </div>
        <div className="mt-3 text-sm text-foreground">
          Все задачи закрыты. Хорошо.
        </div>
      </Card>
    );
  }

  const cat = deadlineCategory(focus.deadline);
  const catLabel =
    cat === "overdue"
      ? "Просрочено"
      : cat === "week"
        ? "На этой неделе"
        : cat === "month"
          ? "В этом месяце"
          : "Позже";
  const catTone =
    cat === "overdue" ? "danger" : cat === "week" ? "warn" : "accent";

  const markDone = () => {
    haptic("success");
    if (focus.status === "todo") {
      cycle(focus.id);
      cycle(focus.id);
    } else {
      cycle(focus.id);
    }
  };

  return (
    <Card className="p-5">
      <div className="mb-3 flex items-center justify-between">
        <div className="font-mono text-xs uppercase tracking-wider text-muted">
          Сейчас фокус
        </div>
        <Badge tone={catTone}>{catLabel}</Badge>
      </div>
      <div className="mb-1 num text-[10px] uppercase tracking-wider text-muted">
        {focus.id}
      </div>
      <div className="mb-4 text-lg leading-tight text-foreground">
        {focus.title}
      </div>
      {focus.result_definition && (
        <div className="mb-4 text-xs leading-relaxed text-muted">
          {focus.result_definition}
        </div>
      )}
      <div className="flex items-center justify-between">
        <span className="num text-xs text-muted">
          до {formatDateRu(focus.deadline)}
        </span>
        <Button size="sm" onClick={markDone}>
          <Check className="mr-1 h-3.5 w-3.5" />
          Сделано
        </Button>
      </div>
    </Card>
  );
}

function WeightCheckIn() {
  const weightEntries = useStore((s) => s.weightEntries);
  const addWeightEntry = useStore((s) => s.addWeightEntry);
  const [value, setValue] = useState("");

  const today = new Date().toISOString().slice(0, 10);
  const todayEntry = weightEntries.find((e) => e.date === today);
  const plan = planWeightForToday(new Date());
  const last = weightEntries.length
    ? weightEntries[weightEntries.length - 1]
    : null;

  const save = () => {
    const n = Number(value);
    if (Number.isNaN(n) || n <= 0) return;
    haptic("success");
    addWeightEntry({ date: today, weight_kg: n });
    setValue("");
  };

  return (
    <Card className="p-5">
      <div className="mb-3 flex items-center justify-between">
        <div className="font-mono text-xs uppercase tracking-wider text-muted">
          Вес · сегодня
        </div>
        {plan != null && (
          <div className="font-mono text-[10px] uppercase tracking-wider text-muted">
            план <span className="num text-foreground/70">{plan}</span> кг
          </div>
        )}
      </div>
      {todayEntry ? (
        <div className="flex items-baseline gap-3">
          <span className="num text-3xl text-foreground">
            {todayEntry.weight_kg}
          </span>
          <span className="font-mono text-xs uppercase tracking-wider text-ok">
            записано
          </span>
        </div>
      ) : (
        <div className="flex gap-2">
          <Input
            type="number"
            step="0.1"
            inputMode="decimal"
            placeholder={last ? String(last.weight_kg) : "110"}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="flex-1"
          />
          <Button onClick={save}>Лог</Button>
        </div>
      )}
      {last && !todayEntry && (
        <div className="mt-2 font-mono text-[10px] uppercase tracking-wider text-muted">
          Прошлый раз: <span className="num text-foreground/70">{last.weight_kg}</span>{" "}
          кг ({formatDateRu(last.date)})
        </div>
      )}
    </Card>
  );
}

function NearestDeadlines() {
  const tasks = useStore((s) => s.tasks);
  const upcoming = tasks
    .filter((t) => t.status !== "done" && t.deadline)
    .slice()
    .sort((a, b) => a.deadline.localeCompare(b.deadline))
    .slice(0, 3);

  if (upcoming.length === 0) return null;

  return (
    <Card className="p-5">
      <div className="mb-3 flex items-center justify-between">
        <div className="font-mono text-xs uppercase tracking-wider text-muted">
          Дедлайны
        </div>
        <Link
          href="/tasks"
          className="flex items-center gap-1 font-mono text-[10px] uppercase tracking-wider text-accent"
        >
          все <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
      <ul className="space-y-2">
        {upcoming.map((t) => {
          const cat = deadlineCategory(t.deadline);
          return (
            <li key={t.id} className="flex items-baseline justify-between gap-3">
              <div className="flex min-w-0 items-baseline gap-2">
                <span className="num shrink-0 text-[11px] text-muted">{t.id}</span>
                <span className="truncate text-sm text-foreground">{t.title}</span>
              </div>
              <span
                className={cn(
                  "num shrink-0 text-[11px]",
                  cat === "overdue"
                    ? "text-danger"
                    : cat === "week"
                      ? "text-warn"
                      : "text-muted"
                )}
              >
                {formatDateRu(t.deadline)}
              </span>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}

export function TodayFocus() {
  return (
    <div className="space-y-4">
      <FocusTask />
      <WeightCheckIn />
      <NearestDeadlines />
    </div>
  );
}
