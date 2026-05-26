"use client";

import { useStore } from "@/lib/store";
import { pickMainTask, slackDays } from "@/lib/today-logic";
import { Button } from "@/components/ui/button";
import { Play, Check, Sparkles } from "lucide-react";
import { haptic } from "@/lib/haptics";
import { BossLinkPill } from "@/components/BossLinkPill";

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
      <div className="panel-hero corners rounded-md p-4 md:p-5 text-center">
        <Sparkles className="h-6 w-6 text-accent-bright mx-auto mb-2" />
        <div className="display text-lg text-foreground">Сейчас стол чист</div>
        <p className="text-sm text-secondary mt-1">
          Выбери задачи в утреннем ритуале или возьми задачу сам.
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
    <div className="panel-hero corners rounded-md p-4 md:p-5">
      <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-accent-bright mb-1">
        ◆ Сейчас
      </div>
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 num text-[10px] uppercase tracking-wider text-secondary">
        <span>
          {current.id} · {current.estimated_days ?? 1} дн.
        </span>
        <BossLinkPill bossId={current.linked_boss} />
        {current.is_today_committed && (
          <span className="text-accent-bright">· взято на сегодня</span>
        )}
      </div>
      <h2 className="display text-xl text-foreground mt-1 leading-tight md:text-2xl">
        {current.title}
      </h2>
      {current.result_definition && (
        <p className="text-sm text-secondary mt-2 line-clamp-2">
          {current.result_definition}
        </p>
      )}
      <div className={`mt-2 font-mono text-[11px] uppercase tracking-wider ${slackTone}`}>
        {slackLabel}
      </div>
      <div className="mt-4 flex gap-2">
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
    </div>
  );
}
