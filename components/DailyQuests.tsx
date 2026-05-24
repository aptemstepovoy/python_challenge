"use client";

import { useEffect, useMemo } from "react";
import { Check, Sparkles, Target } from "lucide-react";
import { useStore } from "@/lib/store";
import { dailyHabits, isPerfectDay } from "@/lib/habits-logic";
import { computeBossState, nearestBoss } from "@/lib/bosses-logic";
import { initialBosses } from "@/lib/initial-data";
import { cn } from "@/lib/utils";
import type { Quest } from "@/lib/types";

const todayISO = () => new Date().toISOString().slice(0, 10);

function evaluate(
  quest: Quest,
  ctx: {
    tasksDoneToday: number;
    habitsDoneToday: number;
    perfectDay: boolean;
    insightsToday: number;
    journalsToday: number;
    weightToday: boolean;
    chestOpenedToday: boolean;
    bossDamageToday: number;
  }
): boolean {
  switch (quest.id) {
    case "close_task_1":
      return ctx.tasksDoneToday >= 1;
    case "close_task_3":
      return ctx.tasksDoneToday >= 3;
    case "habits_3":
      return ctx.habitsDoneToday >= 3;
    case "perfect_day":
      return ctx.perfectDay;
    case "insight_1":
      return ctx.insightsToday >= 1;
    case "journal_1":
      return ctx.journalsToday >= 1;
    case "log_weight":
      return ctx.weightToday;
    case "open_chest":
      return ctx.chestOpenedToday;
    case "boss_damage_50":
      return ctx.bossDamageToday >= quest.goal;
    case "focus_25":
      // Tracked via task time_spent_sec — handled separately
      return false;
    default:
      return false;
  }
}

export function DailyQuests() {
  const ensure = useStore((s) => s.ensureQuestsForToday);
  const completeQuest = useStore((s) => s.completeQuest);
  const dailyQuests = useStore((s) => s.dailyQuests);
  const tasks = useStore((s) => s.tasks);
  const habits = useStore((s) => s.habits);
  const habitLogs = useStore((s) => s.habitLogs);
  const insights = useStore((s) => s.insights);
  const journals = useStore((s) => s.journals);
  const weightEntries = useStore((s) => s.weightEntries);
  const lastChestOpened = useStore((s) => s.lastChestOpened);

  useEffect(() => {
    ensure();
  }, [ensure]);

  const today = todayISO();
  const snap = dailyQuests.find((q) => q.date === today);

  const ctx = useMemo(() => {
    const tasksDoneToday = tasks.filter(
      (t) => t.status === "done" && t.completed_at?.startsWith(today)
    ).length;
    const dailyActive = dailyHabits(habits);
    const habitsDoneToday = dailyActive.filter((h) =>
      habitLogs.some((l) => l.habit_id === h.id && l.date === today)
    ).length;
    const perfectDay = isPerfectDay(habits, habitLogs);
    const insightsToday = insights.filter((i) => i.date === today).length;
    const journalsToday = journals.filter((j) => j.date === today).length;
    const weightToday = weightEntries.some((w) => w.date === today);
    const chestOpenedToday = lastChestOpened === today;

    const bossStates = initialBosses.map((b) =>
      computeBossState(b, tasks, habits, habitLogs)
    );
    const target = nearestBoss(bossStates);
    // approximate: total damage minus a snapshot we don't have — use damage as proxy
    const bossDamageToday = target ? Math.min(target.damage, 9999) : 0;

    return {
      tasksDoneToday,
      habitsDoneToday,
      perfectDay,
      insightsToday,
      journalsToday,
      weightToday,
      chestOpenedToday,
      bossDamageToday,
    };
  }, [
    tasks,
    habits,
    habitLogs,
    insights,
    journals,
    weightEntries,
    lastChestOpened,
    today,
  ]);

  // auto-mark completed quests
  useEffect(() => {
    if (!snap) return;
    for (const q of snap.quests) {
      if (!q.completed && evaluate(q, ctx)) {
        completeQuest(q.id);
      }
    }
  }, [snap, ctx, completeQuest]);

  if (!snap) return null;

  const allDone = snap.quests.every((q) => q.completed);

  return (
    <div className="panel rounded-md p-3">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-secondary">
          <Target className="h-3 w-3" />
          Дневные квесты
        </div>
        <div className="font-mono text-[10px] uppercase tracking-wider text-accent-bright">
          {allDone ? "+50 XP получено" : "награда +50 XP"}
        </div>
      </div>
      <div className="space-y-1.5">
        {snap.quests.map((q) => (
          <div
            key={q.id}
            className={cn(
              "flex items-center gap-2 rounded px-2 py-1.5",
              q.completed
                ? "bg-ok/10 text-ok-bright"
                : "bg-surface-2/40 text-foreground/85"
            )}
          >
            <div
              className={cn(
                "flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border",
                q.completed
                  ? "border-ok-bright bg-ok-bright text-background"
                  : "border-border bg-surface"
              )}
            >
              {q.completed && <Check className="h-3 w-3" strokeWidth={3} />}
            </div>
            <span className={cn("text-sm flex-1", q.completed && "line-through")}>
              {q.name}
            </span>
          </div>
        ))}
      </div>
      {allDone && (
        <div className="mt-2 flex items-center gap-1 font-mono text-[10px] uppercase tracking-wider text-accent-bright">
          <Sparkles className="h-3 w-3" />
          Все квесты выполнены!
        </div>
      )}
    </div>
  );
}
