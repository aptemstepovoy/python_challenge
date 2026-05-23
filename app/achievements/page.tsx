"use client";

import { useEffect, useMemo } from "react";
import { useStore } from "@/lib/store";
import { initialBosses } from "@/lib/initial-data";
import { computeBossState } from "@/lib/bosses-logic";
import {
  ACHIEVEMENTS,
  checkAchievements,
} from "@/lib/achievements-logic";
import { AchievementCard } from "@/components/AchievementCard";

export default function AchievementsPage() {
  const xp = useStore((s) => s.xp);
  const tasks = useStore((s) => s.tasks);
  const habits = useStore((s) => s.habits);
  const habitLogs = useStore((s) => s.habitLogs);
  const reviews = useStore((s) => s.reviews);
  const achievements = useStore((s) => s.achievements);
  const unlock = useStore((s) => s.unlockAchievement);

  const bossStates = useMemo(
    () =>
      initialBosses.map((b) => computeBossState(b, tasks, habits, habitLogs)),
    [tasks, habits, habitLogs]
  );

  const eligible = useMemo(
    () =>
      checkAchievements({
        xp,
        tasks,
        habits,
        habitLogs,
        reviews,
        bossStates,
      }),
    [xp, tasks, habits, habitLogs, reviews, bossStates]
  );

  useEffect(() => {
    const owned = new Set(achievements.map((a) => a.id));
    for (const id of eligible) {
      if (!owned.has(id)) unlock(id);
    }
  }, [eligible, achievements, unlock]);

  const unlockedMap = new Map(achievements.map((a) => [a.id, a.unlocked_at]));
  const unlockedCount = achievements.length;

  return (
    <div className="p-4 space-y-6 md:p-10 md:space-y-8">
      <header className="flex flex-col gap-2 border-b border-border pb-5 md:flex-row md:items-baseline md:justify-between md:pb-6">
        <div>
          <h1 className="display text-2xl text-foreground text-glow md:text-3xl">
            Достижения
          </h1>
          <p className="mt-1 text-sm text-muted">
            Получено{" "}
            <span className="num text-foreground">
              {unlockedCount}
            </span>{" "}
            из {ACHIEVEMENTS.length}
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {ACHIEVEMENTS.map((def) => (
          <AchievementCard
            key={def.id}
            def={def}
            unlockedAt={unlockedMap.get(def.id)}
          />
        ))}
      </div>
    </div>
  );
}
