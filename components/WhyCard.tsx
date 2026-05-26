"use client";

import { useMemo, useState } from "react";
import { Pencil, Target } from "lucide-react";
import { useStore } from "@/lib/store";
import { nearestMilestone } from "@/lib/mission-logic";
import { Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

/**
 * Карточка «Зачем». Видна когда юзер ещё не задал intent дня.
 * Показывает vision-фразу (редактируемую) + ближайший дедлайн шага.
 */
export function WhyCard() {
  const vision = useStore((s) => s.vision);
  const setVision = useStore((s) => s.setVision);
  const steps = useStore((s) => s.steps);
  const today = useMemo(() => new Date(), []);
  const milestone = useMemo(() => nearestMilestone(steps, today), [
    steps,
    today,
  ]);

  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(vision);

  const save = () => {
    setVision(draft);
    setEditing(false);
  };

  if (editing) {
    return (
      <div className="rounded-md border border-accent-dim bg-accent/5 p-3 space-y-2">
        <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-accent-bright">
          ◆ Зачем
        </div>
        <Textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          rows={3}
          maxLength={240}
          placeholder="одной фразой — зачем ты это делаешь"
          autoFocus
        />
        <div className="flex gap-2">
          <Button size="sm" onClick={save}>
            Сохранить
          </Button>
          <button
            onClick={() => {
              setDraft(vision);
              setEditing(false);
            }}
            className="text-xs font-mono uppercase tracking-wider text-secondary hover:text-foreground px-2"
          >
            Отмена
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={() => setEditing(true)}
      className="w-full text-left rounded-md border border-border bg-surface/40 p-3 hover:border-accent-dim transition-colors group"
    >
      <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.2em] text-secondary">
        <span>◆ Зачем</span>
        <Pencil className="h-3 w-3 text-muted group-hover:text-accent-bright" />
      </div>
      <p className="mt-1 text-sm text-foreground leading-snug">{vision}</p>
      {milestone && (
        <div className="mt-2 flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-secondary">
          <Target className="h-3 w-3 text-accent-bright" />
          {milestone.isOverdue ? (
            <span className="text-danger-bright">
              Просрочено: {milestone.step.title} —{" "}
              {-milestone.daysLeft} дн.
            </span>
          ) : milestone.daysLeft === 0 ? (
            <span className="text-warn">
              Сегодня: {milestone.step.title}
            </span>
          ) : (
            <span>
              {milestone.step.title} ·{" "}
              <span className="num text-foreground">
                {milestone.daysLeft}
              </span>{" "}
              дн.
            </span>
          )}
        </div>
      )}
    </button>
  );
}
