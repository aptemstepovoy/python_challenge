"use client";

import { useMemo, useState } from "react";
import { addDays } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Sun, Check, X, Calendar, ChevronRight } from "lucide-react";
import { useStore } from "@/lib/store";
import { pickSuggestedForToday } from "@/lib/today-logic";
import { haptic } from "@/lib/haptics";

const todayISO = () => new Date().toISOString().slice(0, 10);

export function EveningRitual({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  const tasks = useStore((s) => s.tasks);
  const dailyPlans = useStore((s) => s.dailyPlans);
  const finalizeDay = useStore((s) => s.finalizeDay);
  const snoozeTask = useStore((s) => s.snoozeTask);
  const uncommitTask = useStore((s) => s.uncommitTask);
  const updateTask = useStore((s) => s.updateTask);

  const [reflection, setReflection] = useState("");

  const today = todayISO();
  const plan = dailyPlans.find((p) => p.date === today);

  const doneToday = useMemo(
    () =>
      tasks.filter(
        (t) => t.completed_at && t.completed_at.startsWith(today)
      ),
    [tasks, today]
  );

  const committedNotDone = useMemo(() => {
    if (!plan) return [];
    return plan.committed_task_ids
      .map((id) => tasks.find((t) => t.id === id))
      .filter((t): t is NonNullable<typeof t> => !!t && t.status !== "done");
  }, [plan, tasks]);

  const totalXP = doneToday.reduce((acc, t) => acc + (t.xp ?? 25), 0);

  const tomorrowSuggestions = useMemo(
    () => pickSuggestedForToday(tasks, addDays(new Date(), 1), 3),
    [tasks]
  );

  const moveToTomorrow = (id: string) => {
    const tomorrowISO = addDays(new Date(), 1).toISOString().slice(0, 10);
    uncommitTask(id);
    updateTask(id, { snoozed_until: tomorrowISO });
    haptic("tap");
  };

  const snoozeThreeDays = (id: string) => {
    const d = addDays(new Date(), 3).toISOString().slice(0, 10);
    uncommitTask(id);
    updateTask(id, { snoozed_until: d });
    haptic("tap");
  };

  const finish = () => {
    haptic("success");
    finalizeDay(reflection.trim() || undefined);
    setReflection("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sun className="h-4 w-4 text-warn" />
            Завершить день
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Done summary */}
          <div className="rounded-md border border-ok/40 bg-ok/5 px-3 py-2.5">
            <div className="flex items-center justify-between">
              <div className="font-mono text-[10px] uppercase tracking-wider text-ok-bright">
                ◆ Сделано
              </div>
              <div className="num text-[10px] text-ok-bright">
                {doneToday.length} · +{totalXP} XP
              </div>
            </div>
            {doneToday.length === 0 ? (
              <div className="text-sm text-secondary mt-1.5">
                Сегодня ничего не закрыто. Завтра новый старт.
              </div>
            ) : (
              <div className="space-y-1 mt-1.5">
                {doneToday.slice(0, 5).map((t) => (
                  <div
                    key={t.id}
                    className="flex items-center gap-2 text-xs"
                  >
                    <Check className="h-3 w-3 text-ok-bright shrink-0" />
                    <span className="text-foreground truncate flex-1">
                      {t.title}
                    </span>
                    <span className="num text-[10px] text-accent-bright shrink-0">
                      +{t.xp ?? 25}
                    </span>
                  </div>
                ))}
                {doneToday.length > 5 && (
                  <div className="text-[10px] text-secondary">
                    и ещё {doneToday.length - 5}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Not done committed */}
          {committedNotDone.length > 0 && (
            <div className="rounded-md border border-warn/40 bg-warn/5 px-3 py-2.5">
              <div className="font-mono text-[10px] uppercase tracking-wider text-warn mb-2">
                ◆ Не закрыто из committed · {committedNotDone.length}
              </div>
              <div className="space-y-2">
                {committedNotDone.map((t) => (
                  <div key={t.id} className="space-y-1.5">
                    <div className="text-sm text-foreground">{t.title}</div>
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => moveToTomorrow(t.id)}
                        className="flex-1 rounded border border-border bg-surface-2 px-2 py-1 text-[10px] font-mono uppercase tracking-wider text-foreground hover:border-accent-dim"
                      >
                        На завтра
                      </button>
                      <button
                        onClick={() => snoozeThreeDays(t.id)}
                        className="flex-1 rounded border border-border bg-surface-2 px-2 py-1 text-[10px] font-mono uppercase tracking-wider text-foreground hover:border-accent-dim"
                      >
                        +3 дня
                      </button>
                      <button
                        onClick={() => {
                          uncommitTask(t.id);
                          haptic("tap");
                        }}
                        className="rounded border border-border bg-surface-2 px-2 py-1 text-[10px] font-mono uppercase tracking-wider text-secondary hover:text-danger-bright"
                        title="Снять с сегодня"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reflection */}
          <div className="space-y-1.5">
            <div className="font-mono text-[10px] uppercase tracking-wider text-secondary">
              ◆ Одной фразой
            </div>
            <Textarea
              value={reflection}
              onChange={(e) => setReflection(e.target.value)}
              rows={2}
              placeholder="что осталось от дня — урок, ощущение, открытие"
            />
          </div>

          {/* Tomorrow preview */}
          {tomorrowSuggestions.length > 0 && (
            <div className="rounded-md border border-border bg-surface px-3 py-2.5">
              <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-secondary mb-2">
                <Calendar className="h-3 w-3" />
                Завтра на горизонте
              </div>
              <div className="space-y-1">
                {tomorrowSuggestions.map((t) => (
                  <div key={t.id} className="text-xs text-foreground/80 truncate">
                    {t.title}
                  </div>
                ))}
              </div>
              <div className="text-[10px] text-muted mt-1.5">
                Утром выберешь сам.
              </div>
            </div>
          )}

          <div className="flex justify-between gap-2 pt-1">
            <button
              onClick={() => onOpenChange(false)}
              className="text-xs font-mono uppercase tracking-wider text-secondary hover:text-foreground"
            >
              Позже
            </button>
            <Button onClick={finish} size="sm">
              Завершить день
              <ChevronRight className="ml-1 h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
