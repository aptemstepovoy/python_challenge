"use client";

import { useMemo, useState } from "react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import {
  Flame,
  Gift,
  Sparkles,
  Sparkle,
  Target,
} from "lucide-react";
import { useStore } from "@/lib/store";
import { levelFromXP, progressWithinLevel } from "@/lib/xp";
import { perfectDaysStreak } from "@/lib/habits-logic";
import { xpForToday } from "@/lib/daily-xp";
import { daysSinceAccountStart, cn } from "@/lib/utils";
import { DailyChest } from "@/components/DailyChest";
import { DailyQuests } from "@/components/DailyQuests";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useUIStore } from "@/lib/ui-store";

const todayISO = () => new Date().toISOString().slice(0, 10);

function greeting(hour: number): string {
  if (hour < 5) return "Доброй ночи";
  if (hour < 12) return "Доброе утро";
  if (hour < 18) return "Добрый день";
  return "Добрый вечер";
}

function LevelRing({ pct, level }: { pct: number; level: number }) {
  const size = 30;
  const stroke = 3;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="#181c28"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="#7c5cff"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${(c * pct) / 100} ${c}`}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: "stroke-dasharray 500ms ease" }}
        />
      </svg>
      <span className="absolute num text-[10px] text-foreground font-medium">
        {level}
      </span>
    </div>
  );
}

export function CompactHeader({
  now,
  onOpenRitual,
}: {
  now: Date;
  onOpenRitual: () => void;
}) {
  const tasks = useStore((s) => s.tasks);
  const habits = useStore((s) => s.habits);
  const habitLogs = useStore((s) => s.habitLogs);
  const xp = useStore((s) => s.xp);
  const accountStartDate = useStore((s) => s.accountStartDate);
  const dailyXPHistory = useStore((s) => s.dailyXPHistory);
  const dailyPlans = useStore((s) => s.dailyPlans);
  const dailyQuests = useStore((s) => s.dailyQuests);
  const lastChestOpened = useStore((s) => s.lastChestOpened);
  const setInventoryOpen = useUIStore((s) => s.setInventoryOpen);

  const [questsOpen, setQuestsOpen] = useState(false);

  const lvl = levelFromXP(xp);
  const lvlPct = progressWithinLevel(xp);
  const today = todayISO();
  const plan = dailyPlans.find((p) => p.date === today);

  const xpToday = xpForToday(dailyXPHistory, today);
  const streak = perfectDaysStreak(habits, habitLogs, now);

  const committed = useMemo(
    () =>
      tasks.filter((t) => t.is_today_committed && t.status !== "done"),
    [tasks]
  );
  const doneToday = useMemo(
    () =>
      tasks.filter(
        (t) =>
          t.status === "done" && t.completed_at?.startsWith(today)
      ).length,
    [tasks, today]
  );
  const committedTotal = (plan?.committed_task_ids.length ?? 0) || committed.length;
  const committedDone = useMemo(
    () =>
      tasks.filter(
        (t) =>
          plan?.committed_task_ids.includes(t.id) &&
          t.status === "done"
      ).length,
    [tasks, plan]
  );

  const chestAvailable = lastChestOpened !== today;

  const todayQuests = dailyQuests.find((q) => q.date === today);
  const questsTotal = todayQuests?.quests.length ?? 0;
  const questsDone = todayQuests?.quests.filter((q) => q.completed).length ?? 0;

  return (
    <>
      <header className="space-y-2">
        <div className="flex items-baseline justify-between gap-3">
          <div className="min-w-0">
            <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted">
              {format(now, "EEEE, d MMMM", { locale: ru })}
            </div>
            <h1 className="display mt-0.5 text-2xl text-foreground text-glow md:text-3xl">
              {greeting(now.getHours())}
            </h1>
          </div>
          <div className="shrink-0 text-right font-mono text-[10px] uppercase tracking-wider text-muted">
            <div className="num">
              день{" "}
              <span className="text-accent-bright">
                {daysSinceAccountStart(accountStartDate, now)}
              </span>{" "}
              / 365
            </div>
          </div>
        </div>

        {plan?.intent && (
          <div className="text-sm text-accent-bright">◆ {plan.intent}</div>
        )}

        {!plan && (
          <button
            onClick={onOpenRitual}
            className="text-xs text-secondary hover:text-accent-bright"
          >
            Не выбрал задачи — открой утренний ритуал →
          </button>
        )}

        {/* Stat strip — единственная полоска с цифрами */}
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5 font-mono text-[10px] uppercase tracking-wider">
          <button
            onClick={() => setInventoryOpen(true)}
            className="flex items-center gap-1.5"
            title="Уровень"
          >
            <LevelRing pct={lvlPct} level={lvl.num} />
            <span className="text-secondary">{lvl.title}</span>
          </button>

          <span className="text-secondary/40">·</span>
          <span title="XP сегодня">
            <span className="num text-foreground">+{xpToday}</span>
            <span className="text-secondary"> XP</span>
          </span>

          <span className="text-secondary/40">·</span>
          <span className="flex items-center gap-1" title="Streak идеальных дней">
            <Flame className="h-3 w-3 text-pink-bright" />
            <span className="num text-foreground">{streak}</span>
          </span>

          <span className="text-secondary/40">·</span>
          <span title="Закрыто из взятых">
            <span className="num text-foreground">{committedDone || doneToday}</span>
            <span className="text-secondary">
              /{committedTotal || 3}
            </span>
          </span>

          {/* Right-aligned pills */}
          <div className="ml-auto flex items-center gap-1.5">
            {chestAvailable && (
              <DailyChest mode="icon" />
            )}
            {questsTotal > 0 && (
              <button
                onClick={() => setQuestsOpen(true)}
                className={cn(
                  "flex items-center gap-1 rounded-full px-2 py-0.5 transition-colors",
                  questsDone === questsTotal
                    ? "bg-ok/15 text-ok-bright"
                    : "bg-accent/15 text-accent-bright hover:bg-accent/25"
                )}
              >
                <Target className="h-3 w-3" />
                <span className="num">
                  {questsDone}/{questsTotal}
                </span>
              </button>
            )}
          </div>
        </div>
      </header>

      <Dialog open={questsOpen} onOpenChange={setQuestsOpen}>
        <DialogContent className="max-w-md bg-surface-2 border border-border-bright">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkle className="h-4 w-4 text-accent-bright" />
              Дневные квесты
            </DialogTitle>
          </DialogHeader>
          <DailyQuests />
        </DialogContent>
      </Dialog>
    </>
  );
}
