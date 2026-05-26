"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { KGICard } from "@/components/KGICard";
import { WeightChart } from "@/components/WeightChart";
import { HabitHeatmap } from "@/components/HabitHeatmap";
import { CharacterCard } from "@/components/CharacterCard";
import { TodaySummary } from "@/components/TodaySummary";
import { useStore } from "@/lib/store";
import { initialBosses } from "@/lib/initial-data";
import { computeBossState } from "@/lib/bosses-logic";
import { ArrowRight } from "lucide-react";
import {
  PLAN_START,
  TARGET_NOV,
  TARGET_MAY,
  daysSinceStart,
  expectedProgress,
  formatDateRu,
} from "@/lib/utils";
import { differenceInCalendarDays, parseISO } from "date-fns";

export default function DashboardPage() {
  const kgis = useStore((s) => s.kgis);
  const tasks = useStore((s) => s.tasks);
  const habits = useStore((s) => s.habits);
  const habitLogs = useStore((s) => s.habitLogs);
  const reviews = useStore((s) => s.reviews);
  const steps = useStore((s) => s.steps);

  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
  }, []);

  const today = now ?? new Date();
  const expectedNov = expectedProgress(PLAN_START, TARGET_NOV, today);
  const expectedMay = expectedProgress(PLAN_START, TARGET_MAY, today);
  const daysToNov = Math.max(
    0,
    differenceInCalendarDays(parseISO(TARGET_NOV), today)
  );
  const daysToMay = Math.max(
    0,
    differenceInCalendarDays(parseISO(TARGET_MAY), today)
  );

  const bossStates = useMemo(
    () => initialBosses.map((b) =>
      computeBossState(b, tasks, habits, habitLogs)
    ),
    [tasks, habits, habitLogs]
  );

  const stats = {
    total: tasks.length,
    done: tasks.filter((t) => t.status === "done").length,
    in_progress: tasks.filter((t) => t.status === "in_progress").length,
    blocked: tasks.filter((t) => t.status === "blocked").length,
  };
  const tasksPercent = stats.total
    ? Math.round((stats.done / stats.total) * 100)
    : 0;

  const lastReview = reviews[0] ?? null;

  return (
    <div className="p-4 space-y-7 md:p-10 md:space-y-9">
      <header className="border-b border-border pb-5 md:pb-6">
        <h1 className="display text-3xl text-foreground text-glow md:text-4xl">
          Обзор плана
        </h1>
        <p className="mt-2 text-base text-secondary">
          К свободе через систему · 12 месяцев
        </p>
      </header>

      {/* Гейм-якорь и снимок дня (перенесено с /today) */}
      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5">
        <div className="h-[420px] md:h-[480px]">
          <CharacterCard />
        </div>
        <TodaySummary />
      </section>

      {/* Hero: macro progress to milestones */}
      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5">
        <div className="panel-bright corners rounded-md p-5 md:p-6">
          <div className="font-mono text-xs uppercase tracking-[0.2em] text-secondary">
            ◆ Точка контроля
          </div>
          <div className="display mt-2 text-2xl text-foreground md:text-3xl">
            23 ноября 2026
          </div>
          <div className="num mt-1 text-base text-secondary">
            {daysToNov} дней осталось
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="font-mono text-sm uppercase tracking-wider text-secondary">
              Прошло по плану
            </span>
            <span className="num text-lg text-accent-bright">
              {Math.round(expectedNov)}%
            </span>
          </div>
          <Progress value={expectedNov} tone="accent" className="mt-2" />
        </div>

        <div className="panel-bright corners rounded-md p-5 md:p-6">
          <div className="font-mono text-xs uppercase tracking-[0.2em] text-secondary">
            ◆ Финиш
          </div>
          <div className="display mt-2 text-2xl text-foreground md:text-3xl">
            23 мая 2027
          </div>
          <div className="num mt-1 text-base text-secondary">
            {daysToMay} дней до свободы
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="font-mono text-sm uppercase tracking-wider text-secondary">
              Прошло
            </span>
            <span className="num text-lg text-pink-bright">
              {Math.round(expectedMay)}%
            </span>
          </div>
          <Progress value={expectedMay} tone="accent" className="mt-2" />
        </div>
      </section>

      {/* Bosses preview */}
      <section>
        <div className="mb-4 flex items-baseline justify-between">
          <h2 className="display text-2xl text-foreground md:text-3xl">
            Боссы
          </h2>
          <Link
            href="/bosses"
            className="flex items-center gap-1 font-mono text-sm uppercase tracking-wider text-accent-bright hover:text-pink-bright"
          >
            подробнее <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {bossStates.map((s) => (
            <Link
              key={s.boss.id}
              href="/bosses"
              className="panel rounded-md p-4 hover:border-accent-dim transition-colors"
            >
              <div className="mb-2 flex items-center justify-between">
                <div className="display text-lg text-foreground">
                  {s.boss.name}
                </div>
                {s.defeated ? (
                  <Badge tone="ok">Побеждён</Badge>
                ) : (
                  <span className="num text-sm text-foreground">
                    {s.hpRemaining} / {s.boss.total_hp}
                  </span>
                )}
              </div>
              <Progress
                value={100 - s.hpPercent}
                tone={s.defeated ? "ok" : "accent"}
              />
              <div className="mt-2 font-mono text-xs uppercase tracking-wider text-secondary">
                до {formatDateRu(s.boss.target_date)} · награда +{s.boss.reward_xp} XP
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* KGI grid */}
      <section>
        <div className="mb-4 flex items-baseline justify-between">
          <h2 className="display text-2xl text-foreground md:text-3xl">
            Ключевые цели
          </h2>
          <span className="font-mono text-sm uppercase tracking-wider text-secondary">
            6 KGI
          </span>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {kgis.map((k) => (
            <KGICard key={k.id} kgi={k} />
          ))}
        </div>
      </section>

      {/* Weight chart full-width */}
      <section>
        <div className="mb-4 flex items-baseline justify-between">
          <h2 className="display text-2xl text-foreground md:text-3xl">
            Вес · план vs факт
          </h2>
          <span className="font-mono text-sm uppercase tracking-wider text-secondary">
            кг
          </span>
        </div>
        <Card>
          <CardContent className="pt-6">
            <WeightChart />
          </CardContent>
        </Card>
      </section>

      {/* Habits heatmap */}
      <section>
        <div className="mb-4 flex items-baseline justify-between">
          <h2 className="display text-2xl text-foreground md:text-3xl">
            Привычки · 12 недель
          </h2>
          <Link
            href="/habits"
            className="flex items-center gap-1 font-mono text-sm uppercase tracking-wider text-accent-bright hover:text-pink-bright"
          >
            все привычки <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <HabitHeatmap />
      </section>

      {/* Last review */}
      <section>
        <div className="mb-4 flex items-baseline justify-between">
          <h2 className="display text-2xl text-foreground md:text-3xl">
            Последнее ревью
          </h2>
          <Link
            href="/review"
            className="flex items-center gap-1 font-mono text-sm uppercase tracking-wider text-accent-bright hover:text-pink-bright"
          >
            история <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        {lastReview ? (
          <Card>
            <CardContent className="pt-5 space-y-3">
              <div className="flex items-baseline justify-between">
                <span className="num text-base text-foreground">
                  {formatDateRu(lastReview.date)}
                </span>
                <span className="num text-sm text-secondary">
                  вес <span className="text-foreground">{lastReview.weight_kg ?? "—"}</span>
                  {" · "}постов <span className="text-foreground">{lastReview.posts_published ?? "—"}</span>
                  {" · "}apps <span className="text-foreground">{lastReview.applications_sent ?? "—"}</span>
                </span>
              </div>
              {lastReview.wins && (
                <div>
                  <div className="font-mono text-xs uppercase tracking-wider text-secondary mb-1">
                    Что было хорошо
                  </div>
                  <div className="text-base text-foreground">{lastReview.wins}</div>
                </div>
              )}
              {lastReview.blockers && (
                <div>
                  <div className="font-mono text-xs uppercase tracking-wider text-secondary mb-1">
                    Блокеры
                  </div>
                  <div className="text-base text-foreground">{lastReview.blockers}</div>
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="pt-6 text-base text-secondary">
              Ревью ещё не было. Открой /review.
            </CardContent>
          </Card>
        )}
      </section>

      {/* Steps timeline */}
      <section>
        <div className="mb-4 flex items-baseline justify-between">
          <h2 className="display text-2xl text-foreground md:text-3xl">
            Шаги плана
          </h2>
          <Link
            href="/tasks"
            className="flex items-center gap-1 font-mono text-sm uppercase tracking-wider text-accent-bright hover:text-pink-bright"
          >
            задачи <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="panel rounded-md p-4 md:p-5 space-y-3">
          {steps.filter((s) => !s.parent_id).map((s) => {
            const stepTasks = tasks.filter((t) => t.step_id === s.id);
            const done = stepTasks.filter((t) => t.status === "done").length;
            const pct = stepTasks.length
              ? (done / stepTasks.length) * 100
              : 0;
            return (
              <div key={s.id} className="space-y-1.5">
                <div className="flex items-baseline justify-between gap-3">
                  <div className="flex items-baseline gap-3 min-w-0">
                    <span className="num shrink-0 text-sm text-secondary">{s.id}</span>
                    <span className="text-base text-foreground truncate">{s.title}</span>
                  </div>
                  <div className="shrink-0 flex items-baseline gap-3">
                    <span className="num text-sm text-secondary">
                      {done} / {stepTasks.length}
                    </span>
                    <span className="num text-xs text-secondary">
                      {formatDateRu(s.deadline)}
                    </span>
                  </div>
                </div>
                <Progress value={pct} tone="accent" />
              </div>
            );
          })}
        </div>
      </section>

      {/* Stats footer */}
      <section>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: "Задач всего", value: stats.total, tone: "text-foreground" },
            { label: "Закрыто", value: stats.done, tone: "text-ok" },
            { label: "В работе", value: stats.in_progress, tone: "text-accent-bright" },
            { label: "Прогресс", value: `${tasksPercent}%`, tone: "text-pink-bright" },
          ].map((s) => (
            <div key={s.label} className="panel rounded-md p-4">
              <div className="font-mono text-xs uppercase tracking-wider text-secondary">
                {s.label}
              </div>
              <div className={`num mt-1 text-3xl ${s.tone}`}>{s.value}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
