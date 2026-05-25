"use client";

import { useState } from "react";
import { addDays } from "date-fns";
import { X, Coffee } from "lucide-react";
import { useStore } from "@/lib/store";

const isoOf = (d: Date) => d.toISOString().slice(0, 10);

export function RecoveryBanner() {
  const tasks = useStore((s) => s.tasks);
  const dailyPlans = useStore((s) => s.dailyPlans);
  const [dismissed, setDismissed] = useState(false);

  const yesterday = isoOf(addDays(new Date(), -1));
  const yPlan = dailyPlans.find((p) => p.date === yesterday);
  const yClosed = tasks.filter(
    (t) => t.completed_at && t.completed_at.startsWith(yesterday)
  );
  const skipped = !!yPlan && yClosed.length === 0;

  if (!skipped || dismissed) return null;

  return (
    <div className="rounded-md border border-border bg-surface-2/40 p-3 flex items-start gap-3">
      <Coffee className="h-5 w-5 shrink-0 text-accent-bright" />
      <div className="flex-1 min-w-0">
        <div className="text-sm text-foreground">
          Вчера был тихий день. Это нормально.
        </div>
        <div className="text-xs text-secondary mt-0.5">
          Возьми 1–2 задачи сегодня. Streak в безопасности.
        </div>
      </div>
      <button
        onClick={() => setDismissed(true)}
        className="shrink-0 text-secondary hover:text-foreground"
        aria-label="Закрыть"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

export function isRecoveryMode(
  dailyPlans: { date: string }[],
  tasks: { completed_at?: string }[]
): boolean {
  const yesterday = isoOf(addDays(new Date(), -1));
  const yPlan = dailyPlans.find((p) => p.date === yesterday);
  if (!yPlan) return false;
  return !tasks.some((t) => t.completed_at && t.completed_at.startsWith(yesterday));
}
