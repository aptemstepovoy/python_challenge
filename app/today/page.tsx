"use client";

import { useEffect, useState } from "react";
import { useStore } from "@/lib/store";
import { CharacterCard } from "@/components/CharacterCard";
import { TodaySummary } from "@/components/TodaySummary";
import { MainTaskCard } from "@/components/MainTaskCard";
import { TodayTasks } from "@/components/TodayTasks";
import { HabitCircles } from "@/components/HabitCircles";
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
    <div className="p-4 space-y-5 md:p-8 md:space-y-7">
      <header className="flex items-baseline justify-between">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted">
            {now ? format(now, "EEEE, d MMMM", { locale: ru }) : ""}
          </div>
          <h1 className="display mt-1 text-2xl text-foreground text-glow md:text-3xl">
            {now ? greeting(now.getHours()) : "—"}
          </h1>
        </div>
        <div className="text-right font-mono text-[10px] uppercase tracking-wider text-muted">
          <div className="num">
            день <span className="text-accent-bright">{now ? daysSinceStart(now) : 0}</span> / 365
          </div>
          <div className="num mt-1">
            закрыто <span className="text-foreground">{doneToday}</span> сегодня
          </div>
        </div>
      </header>

      <div className="grid grid-cols-[1fr_160px] gap-3 md:grid-cols-[1fr_280px] md:gap-5">
        <TodaySummary />
        <CharacterCard compact />
      </div>

      <MainTaskCard />

      <section>
        <div className="mb-3 flex items-baseline justify-between">
          <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
            ◆ Привычки на сегодня
          </div>
        </div>
        <HabitCircles />
      </section>

      <TodayTasks />

      <PrioritiesList />

      <nav className="flex flex-wrap gap-4 border-t border-border pt-4 font-mono text-[10px] uppercase tracking-wider text-muted">
        <a href="/dashboard" className="hover:text-accent-bright">→ Обзор</a>
        <a href="/achievements" className="hover:text-accent-bright">→ Достижения</a>
        <a href="/bosses" className="hover:text-accent-bright">→ Боссы</a>
        <a href="/review" className="hover:text-accent-bright">→ Ревью</a>
      </nav>
    </div>
  );
}
