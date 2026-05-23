"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { JournalForm } from "@/components/JournalForm";
import { JournalHistory } from "@/components/JournalHistory";
import { DataIO } from "@/components/DataIO";
import { useStore } from "@/lib/store";
import { differenceInCalendarDays, parseISO } from "date-fns";

export default function JournalPage() {
  const journals = useStore((s) => s.journals);
  const [showForm, setShowForm] = useState(true);

  const today = new Date();
  const thisWeek = journals.filter(
    (j) => differenceInCalendarDays(today, parseISO(j.date)) <= 7
  ).length;
  const last30 = journals.filter(
    (j) => differenceInCalendarDays(today, parseISO(j.date)) <= 30
  ).length;

  const streak = useMemo(() => {
    if (journals.length === 0) return 0;
    const dates = new Set(journals.map((j) => j.date));
    let count = 0;
    let cursor = new Date();
    while (true) {
      const iso = cursor.toISOString().slice(0, 10);
      if (dates.has(iso)) {
        count += 1;
        cursor.setDate(cursor.getDate() - 1);
      } else if (count === 0) {
        cursor.setDate(cursor.getDate() - 1);
        const iso2 = cursor.toISOString().slice(0, 10);
        if (dates.has(iso2)) {
          count += 1;
          cursor.setDate(cursor.getDate() - 1);
        } else {
          break;
        }
      } else {
        break;
      }
      if (count > 1000) break;
    }
    return count;
  }, [journals]);

  return (
    <div className="p-4 space-y-6 md:p-10 md:space-y-8">
      <header className="flex flex-col gap-3 border-b border-border pb-5 md:flex-row md:items-baseline md:justify-between md:pb-6">
        <div>
          <h1 className="display text-3xl text-foreground text-glow md:text-4xl">
            Отчёт за день
          </h1>
          <p className="mt-2 text-base text-secondary">
            Что сделано, фокус завтра, состояние, инсайты, рефлексия
          </p>
        </div>
        {!showForm && (
          <Button onClick={() => setShowForm(true)} className="self-start md:self-auto">
            Новый отчёт
          </Button>
        )}
      </header>

      {showForm && (
        <JournalForm onSubmitted={() => setShowForm(false)} />
      )}

      <section>
        <div className="mb-4 display text-2xl text-foreground md:text-3xl">
          История
        </div>
        <JournalHistory />
      </section>

      <section>
        <Card className="p-5 md:p-6">
          <h3 className="mb-4 display text-xl text-foreground">
            Метрики
          </h3>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-md border border-border bg-surface-2/50 p-4">
              <div className="font-mono text-xs uppercase tracking-wider text-secondary">
                Всего отчётов
              </div>
              <div className="num mt-1 text-2xl text-foreground">
                {journals.length}
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
                Streak дней
              </div>
              <div className="num mt-1 text-2xl text-accent-bright">
                {streak}
              </div>
            </div>
          </div>
        </Card>
      </section>

      <section>
        <div className="mb-4 display text-2xl text-foreground md:text-3xl">
          Данные
        </div>
        <DataIO />
      </section>
    </div>
  );
}
