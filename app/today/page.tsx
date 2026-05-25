"use client";

import { useEffect, useMemo, useState } from "react";
import { useStore } from "@/lib/store";
import { CharacterCard } from "@/components/CharacterCard";
import { TodaySummary } from "@/components/TodaySummary";
import { TodayCombined } from "@/components/TodayCombined";
import { NowCard } from "@/components/NowCard";
import { TodayTasksCard } from "@/components/TodayTasksCard";
import { DailyChest } from "@/components/DailyChest";
import { DailyQuests } from "@/components/DailyQuests";
import { StreakDangerBanner } from "@/components/StreakDangerBanner";
import { RecoveryBanner } from "@/components/RecoveryBanner";
import { EffortsToday } from "@/components/EffortsToday";
import { MorningRitual } from "@/components/MorningRitual";
import { daysSinceAccountStart } from "@/lib/utils";
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
  const accountStartDate = useStore((s) => s.accountStartDate);
  const dailyPlans = useStore((s) => s.dailyPlans);
  const [manualRitualOpen, setManualRitualOpen] = useState(false);

  useEffect(() => {
    setNow(new Date());
    const t = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(t);
  }, []);

  const todayISO = now?.toISOString().slice(0, 10) ?? "";
  const plan = dailyPlans.find((p) => p.date === todayISO);

  const doneToday = useMemo(
    () =>
      tasks.filter(
        (t) =>
          t.status === "done" &&
          t.completed_at &&
          t.completed_at.slice(0, 10) === todayISO
      ).length,
    [tasks, todayISO]
  );

  const committed = useMemo(
    () =>
      tasks.filter(
        (t) => t.is_today_committed && t.status !== "done"
      ),
    [tasks]
  );

  const subline = !now
    ? ""
    : plan
    ? `${committed.length} взято · ${doneToday} закрыто`
    : "Не выбрал задачи — открой утренний ритуал →";

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
          {now && !plan && (
            <button
              onClick={() => setManualRitualOpen(true)}
              className="mt-1 text-xs text-secondary hover:text-accent-bright text-left"
            >
              {subline}
            </button>
          )}
          {now && plan && (
            <div className="mt-0.5 text-xs text-secondary">{subline}</div>
          )}
          {plan?.intent && (
            <div className="mt-1 text-sm text-accent-bright">
              ◆ {plan.intent}
            </div>
          )}
        </div>
        <div className="shrink-0 text-right font-mono text-[10px] uppercase tracking-wider text-muted">
          <div className="num">
            день{" "}
            <span className="text-accent-bright">
              {now ? daysSinceAccountStart(accountStartDate, now) : 0}
            </span>{" "}
            / 365
          </div>
          <div className="num mt-1">
            <span className="text-foreground">{doneToday}</span> закрыто
          </div>
        </div>
      </header>

      <StreakDangerBanner />
      <RecoveryBanner />

      <NowCard />

      <TodayTasksCard />

      <DailyChest />
      <DailyQuests />

      <div className="h-[280px]">
        <CharacterCard />
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4">
        <TodaySummary />
        <TodayCombined />
      </div>

      <EffortsToday />

      <MorningRitual
        open={manualRitualOpen}
        onOpenChange={setManualRitualOpen}
      />
    </div>
  );
}
