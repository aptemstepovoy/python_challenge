"use client";

import { useEffect, useState } from "react";
import { useStore } from "@/lib/store";
import { CharacterCard } from "@/components/CharacterCard";
import { MainTaskCard } from "@/components/MainTaskCard";
import { TodayTasks } from "@/components/TodayTasks";
import { HabitCircles } from "@/components/HabitCircles";
import { PrioritiesList } from "@/components/PrioritiesList";
import { BossProgressMini } from "@/components/BossProgressMini";
import { StreakChips } from "@/components/StreakChips";
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
    <div className="p-4 space-y-6 md:p-10 md:space-y-8">
      <header className="text-center md:text-left">
        <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted">
          {now ? format(now, "EEEE, d MMMM", { locale: ru }) : ""}
        </div>
        <h1 className="display mt-2 text-2xl text-foreground text-glow md:text-3xl">
          {now ? greeting(now.getHours()) : "—"}
        </h1>
        <div className="ornament mt-4" />
        <div className="mt-4 flex flex-wrap items-baseline justify-center gap-x-5 gap-y-1 font-mono text-[10px] uppercase tracking-wider text-muted md:justify-start">
          <span className="num">
            день <span className="text-accent-bright">{now ? daysSinceStart(now) : 0}</span> / 365
          </span>
          <span className="num">
            закрыто <span className="text-foreground">{doneToday}</span> сегодня
          </span>
        </div>
      </header>

      <CharacterCard />

      <MainTaskCard />

      <HabitCircles />

      <TodayTasks />

      <PrioritiesList />

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <div className="mb-3 font-mono text-[11px] uppercase tracking-[0.2em] text-muted">
            ◆ Streaks
          </div>
          <StreakChips />
        </div>
        <BossProgressMini />
      </section>

      <nav className="flex flex-wrap justify-center gap-4 border-t border-border pt-5 font-mono text-[10px] uppercase tracking-wider text-muted md:justify-start">
        <a href="/dashboard" className="hover:text-accent-bright">
          → Dashboard
        </a>
        <a href="/achievements" className="hover:text-accent-bright">
          → Достижения
        </a>
        <a href="/bosses" className="hover:text-accent-bright">
          → Боссы
        </a>
      </nav>
    </div>
  );
}
