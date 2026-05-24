"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { VoiceInput } from "@/components/VoiceInput";
import { useStore } from "@/lib/store";
import { formatDateRu } from "@/lib/utils";
import { haptic } from "@/lib/haptics";
import { Trash2, Mic, Lightbulb } from "lucide-react";
import { differenceInCalendarDays, parseISO } from "date-fns";

const todayISO = () => new Date().toISOString().slice(0, 10);

export default function InsightsPage() {
  const insights = useStore((s) => s.insights);
  const addInsight = useStore((s) => s.addInsight);
  const deleteInsight = useStore((s) => s.deleteInsight);

  const [text, setText] = useState("");
  const [usedVoice, setUsedVoice] = useState(false);

  const today = new Date();
  const thisWeek = insights.filter(
    (i) => differenceInCalendarDays(today, parseISO(i.date)) <= 7
  ).length;
  const last30 = insights.filter(
    (i) => differenceInCalendarDays(today, parseISO(i.date)) <= 30
  ).length;
  const fromVoice = insights.filter((i) => i.source === "voice").length;

  const save = () => {
    if (!text.trim()) return;
    haptic("success");
    addInsight({
      date: todayISO(),
      text: text.trim(),
      source: usedVoice ? "voice" : "text",
    });
    setText("");
    setUsedVoice(false);
  };

  const confirmDelete = (id: string) => {
    if (window.confirm("Удалить инсайт?")) deleteInsight(id);
  };

  return (
    <div className="p-4 space-y-6 md:p-10 md:space-y-8">
      <header className="border-b border-border pb-5 md:pb-6">
        <div className="flex items-center gap-3">
          <Lightbulb className="h-7 w-7 text-accent-bright" />
          <h1 className="display text-3xl text-foreground text-glow md:text-4xl">
            Инсайты
          </h1>
        </div>
        <p className="mt-2 text-base text-secondary">
          Идеи, мысли, наблюдения. Голосом или текстом.
          Копятся для анализа.
        </p>
      </header>

      <Card className="p-5 md:p-6">
        <h3 className="mb-3 display text-xl text-foreground">
          Новый инсайт
        </h3>
        <div className="space-y-3">
          <Label>Текст</Label>
          <div className="flex gap-2">
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={4}
              placeholder="что зацепило, что нужно запомнить…"
              className="flex-1"
            />
            <VoiceInput
              onAppend={(chunk) => {
                setUsedVoice(true);
                setText((prev) =>
                  prev ? `${prev.trimEnd()} ${chunk}` : chunk
                );
              }}
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="font-mono text-[11px] uppercase tracking-wider text-secondary">
              +<span className="num text-accent-bright">10</span> XP
              {usedVoice && " · диктовка"}
            </span>
            <Button onClick={save} disabled={!text.trim()}>
              Сохранить
            </Button>
          </div>
        </div>
      </Card>

      <section>
        <div className="mb-4 display text-2xl text-foreground md:text-3xl">
          История
        </div>
        {insights.length === 0 ? (
          <div className="panel rounded-md p-6 text-base text-secondary">
            Инсайтов пока нет. Запиши первый — текстом или голосом.
          </div>
        ) : (
          <ul className="space-y-2">
            {insights.map((i) => (
              <li
                key={i.id}
                className="panel rounded-md p-4 space-y-2"
              >
                <div className="flex items-baseline justify-between gap-3">
                  <span className="num text-sm text-secondary">
                    {formatDateRu(i.date)}
                  </span>
                  <div className="flex items-center gap-2">
                    {i.source === "voice" && (
                      <Mic className="h-3 w-3 text-pink-bright" />
                    )}
                    <button
                      onClick={() => confirmDelete(i.id)}
                      className="text-secondary hover:text-danger-bright"
                      aria-label="delete"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
                <div className="whitespace-pre-line text-base text-foreground">
                  {i.text}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <Card className="p-5 md:p-6">
          <h3 className="mb-4 display text-xl text-foreground">Метрики</h3>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-md border border-border bg-surface-2/50 p-4">
              <div className="font-mono text-xs uppercase tracking-wider text-secondary">
                Всего
              </div>
              <div className="num mt-1 text-2xl text-foreground">
                {insights.length}
              </div>
            </div>
            <div className="rounded-md border border-border bg-surface-2/50 p-4">
              <div className="font-mono text-xs uppercase tracking-wider text-secondary">
                За неделю
              </div>
              <div className="num mt-1 text-2xl text-foreground">
                {thisWeek}
              </div>
            </div>
            <div className="rounded-md border border-border bg-surface-2/50 p-4">
              <div className="font-mono text-xs uppercase tracking-wider text-secondary">
                За месяц
              </div>
              <div className="num mt-1 text-2xl text-foreground">
                {last30}
              </div>
            </div>
            <div className="rounded-md border border-border bg-surface-2/50 p-4">
              <div className="font-mono text-xs uppercase tracking-wider text-secondary">
                Голосом
              </div>
              <div className="num mt-1 text-2xl text-pink-bright">
                {fromVoice}
              </div>
            </div>
          </div>
        </Card>
      </section>
    </div>
  );
}
