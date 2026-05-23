"use client";

import { useEffect, useState } from "react";
import { useStore } from "@/lib/store";
import { CharacterCard } from "@/components/CharacterCard";
import { TodaySummary } from "@/components/TodaySummary";
import { TodayCombined } from "@/components/TodayCombined";
import { MainTaskCard } from "@/components/MainTaskCard";
import { PrioritiesList } from "@/components/PrioritiesList";
import { daysSinceStart } from "@/lib/utils";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

function greeting(hour: number): string {
  if (hour < 5) return "Доброй ночи";
  if (hour < 12) return "Доброе утро";
  if (hour < 18) return "Добрый день";
  return "Добрый вечер";
}

export default function TodayPage() {
  const [now, setNow] = useState<Date | null>(null);
  const tasks = useStore((s) => s.tasks);

  useEffect(() => {
    setNow(new Date());
    const t = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(t);
  }, []);

  const doneToday = tasks.filter(
    (t) =>
      t.status === "done" &&
      t.completed_at &&
      t.completed_at.slice(0, 10) ===
        (now?.toISOString().slice(0, 10) ?? "")
  ).length;

  return (
    <div className="p-3 space-y-4 md:p-6 md:space-y-5">
      <header className="flex items-baseline justify-between gap-3">
        <div className="min-w-0">
          <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted">
            {now ? format(now, "EEEE, d MMMM", { locale: ru }) : ""}
          </div>
          <h1 className="display mt-0.5 text-2xl text-foreground text-glow md:text-3xl">
            {now ? greeting(now.getHours()) : "—"}
          </h1>
        </div>
        <div className="shrink-0 text-right font-mono text-[10px] uppercase tracking-wider text-muted">
          <div className="num">
            день <span className="text-accent-bright">{now ? daysSinceStart(now) : 0}</span> / 365
          </div>
          <div className="num mt-1">
            <span className="text-foreground">{doneToday}</span> закрыто
          </div>
        </div>
      </header>

      <div className="grid grid-cols-2 grid-rows-2 gap-3 md:gap-4">
        <TodaySummary />
        <CharacterCard />
        <TodayCombined />
        <MainTaskCard compact />
      </div>

      <PrioritiesList />

      <nav className="flex flex-wrap gap-4 border-t border-border pt-4 font-mono text-[11px] uppercase tracking-wider text-muted">
        <a href="/dashboard" className="hover:text-accent-bright">→ Обзор</a>
        <a href="/achievements" className="hover:text-accent-bright">→ Достижения</a>
        <a href="/bosses" className="hover:text-accent-bright">→ Боссы</a>
        <a href="/review" className="hover:text-accent-bright">→ Ревью</a>
      </nav>
    </div>
  );
}
