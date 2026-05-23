"use client";

import { useEffect, useState } from "react";
import { useStore } from "@/lib/store";
import { MainTaskCard } from "@/components/MainTaskCard";
import { HabitCircles } from "@/components/HabitCircles";
import { PrioritiesList } from "@/components/PrioritiesList";
import { BossProgressMini } from "@/components/BossProgressMini";
import { StreakChips } from "@/components/StreakChips";
import { XPBadge } from "@/components/XPBadge";
import { daysSinceStart } from "@/lib/utils";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

function greeting(hour: number): string {
  if (hour < 5) return "Ночи";
  if (hour < 12) return "Утра";
  if (hour < 18) return "Дня";
  return "Вечера";
}

export default function TodayPage() {
  const [now, setNow] = useState<Date | null>(null);
  const tasks = useStore((s) => s.tasks);

  useEffect(() => {
    setNow(new Date());
    const t = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(t);
  }, []);

  const open = tasks.filter((t) => t.status !== "done").length;
  const doneToday = tasks.filter(
    (t) =>
      t.status === "done" &&
      t.completed_at &&
      t.completed_at.slice(0, 10) ===
        (now?.toISOString().slice(0, 10) ?? "")
  ).length;

  return (
    <div className="p-4 space-y-6 md:p-10 md:space-y-8">
      <header className="space-y-3 border-b border-border pb-5 md:pb-6">
        <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
          {now ? format(now, "EEEE, d MMMM", { locale: ru }) : ""}
        </div>
        <h1 className="font-mono text-2xl tracking-wider text-foreground md:text-3xl">
          {now ? greeting(now.getHours()) : "—"}
        </h1>
        <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1 font-mono text-[10px] uppercase tracking-wider text-muted">
          <span className="num">
            день <span className="text-foreground">{now ? daysSinceStart(now) : 0}</span> / 365
          </span>
          <span className="num">
            открытых <span className="text-foreground">{open}</span>
          </span>
          <span className="num">
            закрыто сегодня <span className="text-foreground">{doneToday}</span>
          </span>
        </div>
      </header>

      <MainTaskCard />

      <HabitCircles />

      <PrioritiesList />

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <div className="mb-3 font-mono text-[11px] uppercase tracking-[0.15em] text-muted">
            Streaks
          </div>
          <StreakChips />
        </div>
        <BossProgressMini />
      </section>

      <XPBadge />

      <nav className="flex flex-wrap gap-3 border-t border-border pt-5 font-mono text-[10px] uppercase tracking-wider text-muted">
        <a href="/dashboard" className="hover:text-foreground">
          → Dashboard
        </a>
        <a href="/achievements" className="hover:text-foreground">
          → Достижения
        </a>
      </nav>
    </div>
  );
}
