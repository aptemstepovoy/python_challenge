"use client";

import { useEffect, useState } from "react";
import { useStore } from "@/lib/store";
import { CharacterCard } from "@/components/CharacterCard";
import { TodaySummary } from "@/components/TodaySummary";
import { TodayCombined } from "@/components/TodayCombined";
import { MainTaskCard } from "@/components/MainTaskCard";
import { DailyChest } from "@/components/DailyChest";
import { DailyGoalBar } from "@/components/DailyGoalBar";
import { DailyQuests } from "@/components/DailyQuests";
import { StreakDangerBanner } from "@/components/StreakDangerBanner";
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

      <StreakDangerBanner />

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4">
        <DailyChest />
        <DailyGoalBar />
      </div>

      <div className="grid grid-cols-2 grid-rows-2 gap-3 md:gap-4">
        <TodaySummary />
        <CharacterCard />
        <TodayCombined />
        <MainTaskCard compact />
      </div>

      <DailyQuests />
    </div>
  );
}
