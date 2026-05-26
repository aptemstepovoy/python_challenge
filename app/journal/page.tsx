"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { JournalForm } from "@/components/JournalForm";
import { JournalHistory } from "@/components/JournalHistory";
import { AuthBlock } from "@/components/AuthBlock";
import { useStore } from "@/lib/store";
import { differenceInCalendarDays, format, parseISO } from "date-fns";
import { ru } from "date-fns/locale";
import { Check, Sun } from "lucide-react";

const todayISO = () => new Date().toISOString().slice(0, 10);

export default function JournalPage() {
  const journals = useStore((s) => s.journals);
  const tasks = useStore((s) => s.tasks);
  const dailyPlans = useStore((s) => s.dailyPlans);
  const [showForm, setShowForm] = useState(true);

  const today = todayISO();
  const plan = dailyPlans.find((p) => p.date === today);
  const finalized = !!plan?.finalized_at;
  const todayJournal = journals.find((j) => j.date === today);

  const doneToday = useMemo(
    () => tasks.filter((t) => t.completed_at?.startsWith(today)),
    [tasks, today]
  );

  const nowDate = new Date();
  const thisWeek = journals.filter(
    (j) => differenceInCalendarDays(nowDate, parseISO(j.date)) <= 7
  ).length;
  const last30 = journals.filter(
    (j) => differenceInCalendarDays(nowDate, parseISO(j.date)) <= 30
  ).length;

  const streak = useMemo(() => {
    if (journals.length === 0) return 0;
    const dates = new Set(journals.map((j) => j.date));
    let count = 0;
    let cursor = nowDate;
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
    <div className="p-4 space-y-6 md:p-8 md:space-y-8 max-w-3xl mx-auto">
      <header className="flex flex-col gap-3 border-b border-border pb-5 md:flex-row md:items-baseline md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground md:text-3xl">
            Отчёт за день
          </h1>
          <p className="mt-1.5 text-sm text-secondary">
            Что сделано, фокус завтра, состояние, инсайты, рефлексия
          </p>
        </div>
        {finalized && (
          <div className="self-start md:self-auto flex items-center gap-1.5 rounded-full border border-ok/40 bg-ok/10 px-3 py-1 text-[11px] text-ok-bright">
            <Check className="h-3 w-3" />
            День завершён, до завтра
          </div>
        )}
        {!finalized && !showForm && (
          <Button onClick={() => setShowForm(true)} size="sm">
            Новый отчёт
          </Button>
        )}
      </header>

      {finalized && (
        <section className="rounded-lg border border-border bg-surface p-5">
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider text-secondary mb-3">
            <Sun className="h-3.5 w-3.5 text-accent-bright" />
            {format(nowDate, "EEEE, d MMMM", { locale: ru })} · день завершён
          </div>
          <div className="text-xl font-semibold text-foreground mb-1 md:text-2xl">
            Молодец. До завтра.
          </div>
          <p className="text-sm text-secondary leading-relaxed mb-4">
            Сегодня ты закрыл{" "}
            <span className="num text-foreground">{doneToday.length}</span>{" "}
            задач{doneToday.length === 1 ? "у" : ""}. Отчёт сохранён. Следующее
            окно — утром.
          </p>
          {doneToday.length > 0 && (
            <div className="space-y-1">
              {doneToday.slice(0, 8).map((t) => (
                <div
                  key={t.id}
                  className="flex items-center gap-2 text-xs text-foreground/85"
                >
                  <Check className="h-3 w-3 shrink-0 text-ok-bright" />
                  <span className="flex-1 truncate">{t.title}</span>
                </div>
              ))}
              {doneToday.length > 8 && (
                <div className="text-[11px] text-secondary">
                  и ещё {doneToday.length - 8}
                </div>
              )}
            </div>
          )}
          {todayJournal?.reflection && (
            <div className="mt-4 rounded-md border border-border bg-surface-2 px-3 py-2.5">
              <div className="text-[10px] uppercase tracking-wider text-secondary mb-1">
                Рефлексия
              </div>
              <p className="text-sm text-foreground/85 whitespace-pre-wrap">
                {todayJournal.reflection}
              </p>
            </div>
          )}
        </section>
      )}

      {!finalized && showForm && (
        <JournalForm onSubmitted={() => setShowForm(false)} />
      )}

      {finalized && (
        <details>
          <summary className="cursor-pointer text-sm text-secondary hover:text-foreground">
            Дописать ещё одну запись →
          </summary>
          <div className="mt-3">
            <JournalForm />
          </div>
        </details>
      )}

      <section>
        <div className="mb-3 text-xl font-semibold text-foreground">История</div>
        <JournalHistory />
      </section>

      <section className="rounded-lg border border-border bg-surface p-5">
        <h3 className="mb-3 text-base font-semibold text-foreground">Метрики</h3>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <Metric label="Всего отчётов" value={journals.length} />
          <Metric label="За неделю" value={thisWeek} />
          <Metric label="За месяц" value={last30} />
          <Metric label="Streak дней" value={streak} accent />
        </div>
      </section>

      <section className="md:hidden">
        <div className="mb-3 text-base font-semibold text-foreground">Аккаунт</div>
        <div className="rounded-lg border border-border bg-surface p-5">
          <AuthBlock />
        </div>
      </section>
    </div>
  );
}

function Metric({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent?: boolean;
}) {
  return (
    <div className="rounded-md border border-border bg-surface-2 p-3">
      <div className="text-[10px] uppercase tracking-wider text-secondary">
        {label}
      </div>
      <div
        className={`num mt-1 text-xl ${
          accent ? "text-accent-bright" : "text-foreground"
        }`}
      >
        {value}
      </div>
    </div>
  );
}
