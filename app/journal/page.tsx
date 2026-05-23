"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { JournalForm } from "@/components/JournalForm";
import { JournalHistory } from "@/components/JournalHistory";
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
  const stateCount: Record<string, number> = {};
  for (const j of journals) {
    stateCount[j.state] = (stateCount[j.state] ?? 0) + 1;
  }
  const dominant =
    Object.entries(stateCount).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";

  return (
    <div className="p-4 space-y-6 md:p-10 md:space-y-8">
      <header className="flex flex-col gap-3 border-b border-border pb-5 md:flex-row md:items-baseline md:justify-between md:pb-6">
        <div>
          <h1 className="display text-3xl text-foreground text-glow md:text-4xl">
            Ежедневный отчёт
          </h1>
          <p className="mt-2 text-base text-secondary">
            Что сделано, фокус завтра, состояние, инсайты, рефлексия
          </p>
        </div>
        {!showForm && (
          <Button onClick={() => setShowForm(true)} className="self-start md:self-auto">
            Новая запись
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
            Метрики дневника
          </h3>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-md border border-border bg-surface-2/50 p-4">
              <div className="font-mono text-xs uppercase tracking-wider text-secondary">
                Всего записей
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
                Состояние чаще
              </div>
              <div className="num mt-1 text-2xl text-accent-bright capitalize">
                {dominant}
              </div>
            </div>
          </div>
        </Card>
      </section>
    </div>
  );
}
