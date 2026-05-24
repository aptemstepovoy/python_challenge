"use client";

import { useEffect, useState } from "react";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Square, Target } from "lucide-react";
import { haptic } from "@/lib/haptics";

function formatMinutes(sec: number): string {
  const m = Math.floor(sec / 60);
  if (m < 1) return "< 1 мин";
  if (m < 60) return `${m} мин`;
  const h = Math.floor(m / 60);
  const mm = m % 60;
  return `${h} ч ${mm} мин`;
}

export function FocusTimer() {
  const taskId = useStore((s) => s.activeTimerTaskId);
  const startedAt = useStore((s) => s.activeTimerStartedAt);
  const tasks = useStore((s) => s.tasks);
  const stop = useStore((s) => s.stopTimer);

  const [minutesLabel, setMinutesLabel] = useState("< 1 мин");

  useEffect(() => {
    if (!taskId || !startedAt) {
      setMinutesLabel("< 1 мин");
      return;
    }
    const start = new Date(startedAt).getTime();
    const tick = () => {
      const sec = Math.max(0, Math.round((Date.now() - start) / 1000));
      setMinutesLabel(formatMinutes(sec));
    };
    tick();
    const i = setInterval(tick, 30_000);
    return () => clearInterval(i);
  }, [taskId, startedAt]);

  if (!taskId) return null;
  const task = tasks.find((t) => t.id === taskId);
  if (!task) return null;

  return (
    <div
      className="fixed left-2 right-2 bottom-16 z-40 mx-auto max-w-md rounded-md panel-bright p-3 shadow-glow md:left-auto md:bottom-4 md:right-4 md:max-w-sm"
      style={{ boxShadow: "0 0 30px -4px rgba(167,139,250,0.45)" }}
    >
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-violet to-pink text-white">
          <Target className="h-4 w-4" strokeWidth={2.5} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-mono text-[10px] uppercase tracking-wider text-secondary truncate">
            {task.id} · в работе
          </div>
          <div className="flex items-baseline gap-3">
            <span className="num text-base text-foreground tabular-nums">
              {minutesLabel}
            </span>
            <span className="text-sm text-foreground/80 truncate">
              {task.title}
            </span>
          </div>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            haptic("tap");
            stop();
          }}
          className="shrink-0"
        >
          <Square className="h-3.5 w-3.5 mr-1" />
          Стоп
        </Button>
      </div>
    </div>
  );
}
