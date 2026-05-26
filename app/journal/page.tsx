"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { JournalForm } from "@/components/JournalForm";
import { JournalHistory } from "@/components/JournalHistory";
import { DataIO } from "@/components/DataIO";
import { AuthBlock } from "@/components/AuthBlock";
import { useStore } from "@/lib/store";
import { differenceInCalendarDays, format, parseISO } from "date-fns";
import { ru } from "date-fns/locale";
import { Check, Sparkles, Sun } from "lucide-react";

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
  const xpToday = doneToday.reduce((acc, t) => acc + (t.xp ?? 25), 0);

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
        {finalized && (
          <div className="self-start md:self-auto flex items-center gap-2 rounded-full border border-ok/40 bg-ok/10 px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider text-ok-bright">
            <Check className="h-3 w-3" />
            День завершён, до завтра
          </div>
        )}
        {!finalized && !showForm && (
          <Button onClick={() => setShowForm(true)} className="self-start md:self-auto">
            Новый отчёт
          </Button>
        )}
      </header>

      {finalized && (
        <Card className="p-5 md:p-6">
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-accent-bright mb-3">
            <Sun className="h-3.5 w-3.5" />
            {format(nowDate, "EEEE, d MMMM", { locale: ru })} · день завершён
          </div>
          <div className="display text-2xl text-foreground text-glow mb-2 md:text-3xl">
            Молодец. До завтра.
          </div>
          <p className="text-sm text-secondary leading-relaxed mb-4">
            Сегодня ты закрыл{" "}
            <span className="num text-foreground">{doneToday.length}</span>{" "}
            задач{doneToday.length === 1 ? "у" : ""} на{" "}
            <span className="num text-accent-bright">+{xpToday}</span> XP.
            Отчёт сохранён. Следующее окно — утром.
          </p>
          {doneToday.length > 0 && (
            <div className="space-y-1">
              {doneToday.slice(0, 8).map((t) => (
                <div
                  key={t.id}
                  className="flex items-center gap-2 text-xs text-foreground/80"
                >
                  <Check className="h-3 w-3 shrink-0 text-ok-bright" />
                  <span className="flex-1 truncate">{t.title}</span>
                  <span className="num text-[10px] text-accent-bright shrink-0">
                    +{t.xp ?? 25}
                  </span>
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
            <div className="mt-4 rounded-md border border-border bg-surface-2/40 px-3 py-2.5">
              <div className="font-mono text-[10px] uppercase tracking-wider text-secondary mb-1">
                Рефлексия
              </div>
              <p className="text-sm text-foreground/85 whitespace-pre-wrap">
                {todayJournal.reflection}
              </p>
            </div>
          )}
          <div className="mt-4 flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-muted">
            <Sparkles className="h-3 w-3 text-accent-bright" />
            Хочешь дописать что-то — пожалуйста, форма ниже остаётся открытой.
          </div>
        </Card>
      )}

      {!finalized && showForm && (
        <JournalForm onSubmitted={() => setShowForm(false)} />
      )}

      {finalized && (
        <details className="group">
          <summary className="cursor-pointer text-sm text-secondary hover:text-foreground">
            Дописать ещё одну запись →
          </summary>
          <div className="mt-3">
            <JournalForm />
          </div>
        </details>
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

      <section className="md:hidden">
        <div className="mb-4 display text-2xl text-foreground">
          Аккаунт
        </div>
        <div className="panel rounded-md p-5">
          <AuthBlock />
        </div>
      </section>
    </div>
  );
}
