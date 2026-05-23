"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input, Textarea } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";
import { haptic } from "@/lib/haptics";
import { cn } from "@/lib/utils";
import type { JournalState } from "@/lib/types";

const todayISO = () => new Date().toISOString().slice(0, 10);

const STATES: { value: JournalState; label: string; color: string }[] = [
  { value: "great", label: "Огонь", color: "#34d399" },
  { value: "good", label: "Хорошо", color: "#a78bfa" },
  { value: "neutral", label: "Норм", color: "#b8b1cc" },
  { value: "tired", label: "Устал", color: "#fbbf24" },
  { value: "down", label: "Плохо", color: "#f87171" },
];

export function JournalForm({ onSubmitted }: { onSubmitted?: () => void }) {
  const addJournal = useStore((s) => s.addJournal);
  const journals = useStore((s) => s.journals);

  const todayJournal = journals.find((j) => j.date === todayISO());

  const [date, setDate] = useState(todayISO());
  const [done, setDone] = useState("");
  const [focus, setFocus] = useState("");
  const [state, setState] = useState<JournalState>("neutral");
  const [insights, setInsights] = useState("");
  const [reflection, setReflection] = useState("");

  const submit = () => {
    if (!done.trim() && !focus.trim() && !reflection.trim() && !insights.trim()) {
      return;
    }
    haptic("success");
    addJournal({
      date,
      done_today: done,
      focus_tomorrow: focus,
      state,
      insights,
      reflection,
    });
    setDone("");
    setFocus("");
    setInsights("");
    setReflection("");
    setState("neutral");
    onSubmitted?.();
  };

  return (
    <Card className="p-5 md:p-6">
      <h3 className="mb-2 display text-xl text-foreground">
        Новая запись
      </h3>
      {todayJournal && (
        <p className="mb-5 text-sm text-pink-bright">
          За сегодня уже есть запись. Новая будет дополнительной.
        </p>
      )}
      <div className="space-y-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Дата</Label>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Состояние</Label>
            <div className="flex flex-wrap gap-1.5">
              {STATES.map((s) => (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => setState(s.value)}
                  className={cn(
                    "rounded-md border px-3 py-2 text-sm transition-colors",
                    state === s.value
                      ? "border-transparent text-background"
                      : "border-border text-foreground hover:border-accent-dim"
                  )}
                  style={
                    state === s.value
                      ? { background: s.color }
                      : { color: s.color }
                  }
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label>Что сделано сегодня</Label>
          <Textarea
            value={done}
            onChange={(e) => setDone(e.target.value)}
            rows={4}
            placeholder="конкретные результаты, не процесс"
          />
        </div>

        <div className="space-y-1.5">
          <Label>Фокусные задачи на завтра</Label>
          <Textarea
            value={focus}
            onChange={(e) => setFocus(e.target.value)}
            rows={3}
            placeholder="1-3 главных задачи"
          />
        </div>

        <div className="space-y-1.5">
          <Label>Инсайты</Label>
          <Textarea
            value={insights}
            onChange={(e) => setInsights(e.target.value)}
            rows={3}
            placeholder="что нового понял, идеи, наблюдения"
          />
        </div>

        <div className="space-y-1.5">
          <Label>Рефлексия дня</Label>
          <Textarea
            value={reflection}
            onChange={(e) => setReflection(e.target.value)}
            rows={4}
            placeholder="как прошёл день, эмоции, что бы изменил"
          />
        </div>
      </div>
      <div className="mt-5 flex justify-end">
        <Button onClick={submit}>Сохранить запись</Button>
      </div>
    </Card>
  );
}
