"use client";

import { useStore } from "@/lib/store";
import { pickMainTask, slackDays } from "@/lib/today-logic";
import { Button } from "@/components/ui/button";
import { Play, Check } from "lucide-react";
import { haptic } from "@/lib/haptics";

export function NowCard() {
  const tasks = useStore((s) => s.tasks);
  const startTask = useStore((s) => s.startTask);
  const completeTask = useStore((s) => s.completeTask);
  const startTimer = useStore((s) => s.startTimer);
  const stopTimer = useStore((s) => s.stopTimer);
  const activeId = useStore((s) => s.activeTimerTaskId);

  const current = activeId
    ? tasks.find((t) => t.id === activeId) ?? pickMainTask(tasks)
    : pickMainTask(tasks);

  if (!current) {
    return (
      <div className="rounded-lg border border-border bg-surface p-5 text-center">
        <div className="text-base text-foreground">Стол чист</div>
        <p className="text-sm text-secondary mt-1">
          Положи задачу на сегодня в утреннем ритуале или возьми из плана.
        </p>
      </div>
    );
  }

  const started = current.status === "in_progress";
  const slack = slackDays(current);
  const slackLabel =
    slack < 0
      ? `Опаздываешь на ${-slack} дн.`
      : slack === 0
      ? "Старт сегодня"
      : `${slack} дн. запас`;
  const slackTone =
    slack < 0
      ? "text-danger-bright"
      : slack === 0
      ? "text-warn"
      : "text-secondary";

  return (
    <section className="rounded-lg border border-accent/40 bg-surface p-5 space-y-3">
      <div className="text-[11px] uppercase tracking-wider text-secondary">
        Сейчас
      </div>
      <h2 className="text-xl font-semibold text-foreground leading-tight md:text-2xl">
        {current.title}
      </h2>
      {current.result_definition && (
        <p className="text-sm text-secondary line-clamp-2">
          {current.result_definition}
        </p>
      )}
      <div className={`text-[12px] num ${slackTone}`}>{slackLabel}</div>
      <div className="flex gap-2 pt-1">
        <Button
          variant={started ? "outline" : "default"}
          className="flex-1"
          onClick={() => {
            haptic("tap");
            if (!started) {
              startTask(current.id);
              startTimer(current.id);
            }
          }}
          disabled={started}
        >
          <Play className="mr-1.5 h-4 w-4" />
          {started ? "В работе" : "Начать"}
        </Button>
        <Button
          className="flex-1"
          onClick={() => {
            haptic("success");
            stopTimer();
            completeTask(current.id);
          }}
        >
          <Check className="mr-1.5 h-4 w-4" />
          Готово
        </Button>
      </div>
    </section>
  );
}
