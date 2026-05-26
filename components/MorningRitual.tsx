"use client";

import { useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Check, ChevronRight, Sparkles } from "lucide-react";
import { useStore } from "@/lib/store";
import { pickSuggestedForToday, slackDays } from "@/lib/today-logic";
import { haptic } from "@/lib/haptics";
import { cn } from "@/lib/utils";
import type { EnergyLevel } from "@/lib/types";

const ENERGY_OPTIONS: { value: EnergyLevel; label: string; hint: string }[] = [
  { value: "low", label: "Low", hint: "усталость / рутина" },
  { value: "medium", label: "Medium", hint: "ровно, обычный день" },
  { value: "high", label: "High", hint: "энергия, глубокая работа" },
];

const energyRank: Record<EnergyLevel, number> = {
  low: 1,
  medium: 2,
  high: 3,
};

function energyFits(
  taskEnergy: EnergyLevel | undefined,
  mood: EnergyLevel | undefined
): boolean {
  if (!taskEnergy || !mood) return true;
  return energyRank[taskEnergy] <= energyRank[mood];
}

export function MorningRitual({
  open,
  onOpenChange,
  maxPicks = 3,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  maxPicks?: number;
}) {
  const tasks = useStore((s) => s.tasks);
  const commit = useStore((s) => s.commitTasksForToday);

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [mood, setMood] = useState<EnergyLevel | undefined>(undefined);
  const [intent, setIntent] = useState("");
  const [picks, setPicks] = useState<string[]>([]);

  const today = useMemo(() => new Date(), []);
  const suggestions = useMemo(
    () => pickSuggestedForToday(tasks, today, 8),
    [tasks, today]
  );

  const reset = () => {
    setStep(1);
    setMood(undefined);
    setIntent("");
    setPicks([]);
  };

  const close = (o: boolean) => {
    onOpenChange(o);
    if (!o) setTimeout(reset, 200);
  };

  const togglePick = (id: string) => {
    setPicks((p) =>
      p.includes(id)
        ? p.filter((x) => x !== id)
        : p.length >= maxPicks
        ? p
        : [...p, id]
    );
    haptic("tap");
  };

  const finish = () => {
    haptic("success");
    commit(picks, mood, intent.trim() || undefined);
    close(false);
  };

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-accent-bright" />
            Утренний ритуал
          </DialogTitle>
        </DialogHeader>

        <div className="mb-3 flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-secondary">
          {([1, 2, 3] as const).map((s, i) => (
            <div key={s} className="flex items-center gap-1.5">
              <span
                className={cn(
                  "flex h-4 w-4 items-center justify-center rounded-full text-[9px] num",
                  step === s
                    ? "bg-accent text-white"
                    : step > s
                    ? "bg-ok text-background"
                    : "bg-surface-2 text-muted"
                )}
              >
                {step > s ? <Check className="h-2.5 w-2.5" strokeWidth={3} /> : s}
              </span>
              <span className={step === s ? "text-foreground" : ""}>
                {s === 1 ? "Состояние" : s === 2 ? "Выбор" : "Подтверждение"}
              </span>
              {i < 2 && <ChevronRight className="h-3 w-3 text-muted" />}
            </div>
          ))}
        </div>

        {step === 1 && (
          <div className="space-y-4">
            <div>
              <div className="text-sm text-foreground mb-2">
                Какая сегодня энергия?
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                {ENERGY_OPTIONS.map((e) => (
                  <button
                    key={e.value}
                    onClick={() => {
                      setMood(e.value);
                      haptic("tap");
                    }}
                    className={cn(
                      "rounded-md border px-2 py-2 text-left transition-colors",
                      mood === e.value
                        ? "border-accent bg-accent/15"
                        : "border-border bg-surface-2 hover:border-accent-dim"
                    )}
                  >
                    <div className="font-mono text-xs uppercase tracking-wider text-foreground">
                      {e.label}
                    </div>
                    <div className="text-[10px] text-secondary leading-snug mt-0.5">
                      {e.hint}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="text-sm text-foreground mb-2">
                Что важно сегодня?
              </div>
              <Input
                value={intent}
                onChange={(e) => setIntent(e.target.value)}
                placeholder="одна фраза — внутренний компас на день"
                maxLength={120}
              />
              <div className="text-[10px] text-muted mt-1">
                Необязательно. Появится в шапке Today.
              </div>
            </div>

            <div className="flex justify-between">
              <button
                onClick={() => close(false)}
                className="text-xs font-mono uppercase tracking-wider text-secondary hover:text-foreground"
              >
                Пропустить
              </button>
              <Button
                onClick={() => setStep(2)}
                disabled={!mood}
                size="sm"
              >
                Дальше
                <ChevronRight className="ml-1 h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-3">
            <div className="text-sm text-foreground">
              Что ты сегодня делаешь? Выбери до {maxPicks}.
            </div>
            <div className="space-y-1.5 max-h-[50vh] overflow-y-auto">
              {suggestions.length === 0 && (
                <div className="text-sm text-secondary text-center py-6">
                  Нечего предложить — задач на горизонте нет.
                </div>
              )}
              {suggestions.map((t) => {
                const picked = picks.includes(t.id);
                const disabled = !picked && picks.length >= maxPicks;
                const slack = slackDays(t, today);
                const slackLabel =
                  slack < 0
                    ? `опаздываешь ${-slack}`
                    : slack === 0
                    ? "старт сегодня"
                    : `+${slack} дн.`;
                const slackTone =
                  slack < 0
                    ? "text-danger-bright"
                    : slack === 0
                    ? "text-warn"
                    : "text-secondary";
                const fits = energyFits(t.energy, mood);
                return (
                  <button
                    key={t.id}
                    onClick={() => !disabled && togglePick(t.id)}
                    disabled={disabled}
                    className={cn(
                      "w-full flex items-start gap-2.5 rounded-md border px-3 py-2 text-left transition-colors",
                      picked
                        ? "border-accent bg-accent/10"
                        : disabled
                        ? "border-border bg-surface-2/40 opacity-50 cursor-not-allowed"
                        : "border-border bg-surface-2 hover:border-accent-dim"
                    )}
                  >
                    <div
                      className={cn(
                        "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border",
                        picked
                          ? "border-accent bg-accent text-white"
                          : "border-border bg-surface"
                      )}
                    >
                      {picked && <Check className="h-3 w-3" strokeWidth={3} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-foreground truncate">
                        {t.title}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5 font-mono text-[10px] uppercase tracking-wider">
                        <span className="text-muted">{t.id}</span>
                        <span className={slackTone}>{slackLabel}</span>
                        {t.energy && (
                          <span
                            className={
                              fits ? "text-ok-bright" : "text-muted"
                            }
                          >
                            ⚡{t.energy}
                          </span>
                        )}
                        <span className="text-muted ml-auto">
                          {t.estimated_days ?? 1} дн.
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
            <div className="flex justify-between items-center">
              <button
                onClick={() => setStep(1)}
                className="text-xs font-mono uppercase tracking-wider text-secondary hover:text-foreground"
              >
                ← Назад
              </button>
              <div className="font-mono text-[10px] uppercase tracking-wider text-secondary">
                выбрано <span className="num text-foreground">{picks.length}</span> / {maxPicks}
              </div>
              <Button
                onClick={() => setStep(3)}
                disabled={picks.length === 0}
                size="sm"
              >
                Дальше
                <ChevronRight className="ml-1 h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <div className="text-sm text-secondary">Сегодня я делаю:</div>
            <div className="space-y-1.5">
              {picks.map((id) => {
                const t = tasks.find((x) => x.id === id);
                if (!t) return null;
                return (
                  <div
                    key={id}
                    className="rounded-md border border-accent/40 bg-accent/10 px-3 py-2"
                  >
                    <div className="text-sm text-foreground">{t.title}</div>
                    <div className="font-mono text-[10px] uppercase tracking-wider text-secondary mt-0.5">
                      {t.id} · {t.estimated_days ?? 1} дн.
                    </div>
                  </div>
                );
              })}
            </div>
            {intent.trim() && (
              <div className="rounded-md border border-border bg-surface-2/40 px-3 py-2">
                <div className="font-mono text-[10px] uppercase tracking-wider text-secondary">
                  Сегодня важно
                </div>
                <div className="text-sm text-foreground mt-0.5">{intent}</div>
              </div>
            )}
            <div className="flex justify-between">
              <button
                onClick={() => setStep(2)}
                className="text-xs font-mono uppercase tracking-wider text-secondary hover:text-foreground"
              >
                ← Назад
              </button>
              <Button onClick={finish} size="sm">
                Поехали
                <ChevronRight className="ml-1 h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
