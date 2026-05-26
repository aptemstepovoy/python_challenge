"use client";

import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Input, Textarea } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";
import { haptic } from "@/lib/haptics";
import { Lightbulb, Plus } from "lucide-react";

const todayISO = () => new Date().toISOString().slice(0, 10);

export function JournalForm({ onSubmitted }: { onSubmitted?: () => void }) {
  const addJournal = useStore((s) => s.addJournal);
  const finalizeDay = useStore((s) => s.finalizeDay);
  const journals = useStore((s) => s.journals);
  const allInsights = useStore((s) => s.insights);

  const todayJournal = journals.find((j) => j.date === todayISO());

  const [date, setDate] = useState(todayISO());
  const [done, setDone] = useState("");
  const [focus, setFocus] = useState("");
  const [state, setState] = useState("");
  const [insights, setInsights] = useState("");
  const [reflection, setReflection] = useState("");
  const [imported, setImported] = useState<Set<string>>(new Set());

  const dayInsights = useMemo(
    () => allInsights.filter((i) => i.date === date),
    [allInsights, date]
  );

  const importOne = (id: string, text: string) => {
    if (imported.has(id)) return;
    setInsights((prev) => (prev ? prev + "\n• " + text : "• " + text));
    setImported((s) => new Set(s).add(id));
    haptic("tap");
  };

  const importAll = () => {
    const fresh = dayInsights.filter((i) => !imported.has(i.id));
    if (fresh.length === 0) return;
    const block = fresh.map((i) => "• " + i.text).join("\n");
    setInsights((prev) => (prev ? prev + "\n" + block : block));
    setImported((s) => {
      const n = new Set(s);
      fresh.forEach((i) => n.add(i.id));
      return n;
    });
    haptic("success");
  };

  const submit = () => {
    if (
      !done.trim() &&
      !focus.trim() &&
      !reflection.trim() &&
      !insights.trim() &&
      !state.trim()
    ) {
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
    // Если запись за сегодня — финализируем день.
    if (date === todayISO()) {
      finalizeDay(reflection.trim() || undefined);
    }
    setDone("");
    setFocus("");
    setInsights("");
    setReflection("");
    setState("");
    setImported(new Set());
    onSubmitted?.();
  };

  return (
    <Card className="p-5 md:p-6">
      <h3 className="mb-2 display text-xl text-foreground">
        Новый отчёт
      </h3>
      {todayJournal && (
        <p className="mb-5 text-sm text-pink-bright">
          За сегодня уже есть запись. Новая будет дополнительной.
        </p>
      )}
      <div className="space-y-5">
        <div className="space-y-1.5">
          <Label>Дата</Label>
          <Input
            type="date"
            value={date}
            onChange={(e) => {
              setDate(e.target.value);
              setImported(new Set());
            }}
          />
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
            placeholder="1–3 главных задачи"
          />
        </div>

        <div className="space-y-1.5">
          <Label>Состояние</Label>
          <Textarea
            value={state}
            onChange={(e) => setState(e.target.value)}
            rows={2}
            placeholder="опиши состояние своими словами"
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label>Инсайты</Label>
            {dayInsights.length > 0 && (
              <button
                type="button"
                onClick={importAll}
                className="font-mono text-[10px] uppercase tracking-wider text-accent-bright hover:text-pink-bright"
              >
                Подтянуть все ({dayInsights.length})
              </button>
            )}
          </div>

          {dayInsights.length > 0 && (
            <div className="rounded-md border border-accent-dim/40 bg-accent/5 p-2.5 space-y-1.5">
              <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-accent-bright">
                <Lightbulb className="h-3 w-3" />
                Записано за {date} · {dayInsights.length}
              </div>
              {dayInsights.map((i) => {
                const used = imported.has(i.id);
                return (
                  <button
                    key={i.id}
                    type="button"
                    onClick={() => importOne(i.id, i.text)}
                    disabled={used}
                    className={
                      "w-full flex items-start gap-2 rounded border px-2 py-1.5 text-left transition-colors " +
                      (used
                        ? "border-border bg-surface-2/40 text-muted line-through cursor-not-allowed"
                        : "border-border bg-surface hover:border-accent-dim text-foreground")
                    }
                  >
                    <Plus className="h-3 w-3 mt-0.5 shrink-0 text-accent-bright" />
                    <span className="flex-1 text-xs leading-snug">
                      {i.text}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

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
        <Button onClick={submit}>Сохранить отчёт</Button>
      </div>
    </Card>
  );
}
