"use client";

import { useEffect, useMemo } from "react";
import { useStore } from "@/lib/store";
import { initialBosses } from "@/lib/initial-data";
import { computeBossState } from "@/lib/bosses-logic";
import {
  ACHIEVEMENTS,
  type AchievementCategory,
  type AchievementDef,
  checkAchievements,
} from "@/lib/achievements-logic";
import { AchievementCard } from "@/components/AchievementCard";

const CATEGORY_ORDER: AchievementCategory[] = [
  "старт",
  "уровни",
  "стрики",
  "привычки",
  "задачи",
  "тело",
  "карьера",
  "продукт",
  "боссы",
  "ревью",
];

export default function AchievementsPage() {
  const xp = useStore((s) => s.xp);
  const tasks = useStore((s) => s.tasks);
  const habits = useStore((s) => s.habits);
  const habitLogs = useStore((s) => s.habitLogs);
  const reviews = useStore((s) => s.reviews);
  const kgis = useStore((s) => s.kgis);
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
        kgis,
        bossStates,
      }),
    [xp, tasks, habits, habitLogs, reviews, kgis, bossStates]
  );

  useEffect(() => {
    const owned = new Set(achievements.map((a) => a.id));
    for (const id of eligible) {
      if (!owned.has(id)) unlock(id);
    }
  }, [eligible, achievements, unlock]);

  const unlockedMap = new Map(achievements.map((a) => [a.id, a.unlocked_at]));
  const unlockedCount = achievements.length;

  const byCategory = useMemo(() => {
    const map = new Map<AchievementCategory, AchievementDef[]>();
    for (const a of ACHIEVEMENTS) {
      const list = map.get(a.category) ?? [];
      list.push(a);
      map.set(a.category, list);
    }
    return map;
  }, []);

  return (
    <div className="p-4 space-y-7 md:p-10 md:space-y-9">
      <header className="flex flex-col gap-2 border-b border-border pb-5 md:flex-row md:items-baseline md:justify-between md:pb-6">
        <div>
          <h1 className="display text-3xl text-foreground text-glow md:text-4xl">
            Достижения
          </h1>
          <p className="mt-2 text-base text-muted">
            Получено{" "}
            <span className="num text-accent-bright">{unlockedCount}</span>{" "}
            из <span className="num text-foreground">{ACHIEVEMENTS.length}</span>
          </p>
        </div>
      </header>

      {CATEGORY_ORDER.map((cat) => {
        const list = byCategory.get(cat);
        if (!list || list.length === 0) return null;
        const inCatUnlocked = list.filter((d) =>
          unlockedMap.has(d.id)
        ).length;
        return (
          <section key={cat} className="space-y-3">
            <div className="flex items-baseline justify-between">
              <h2 className="display text-xl text-accent-bright md:text-2xl">
                {cat.toUpperCase()}
              </h2>
              <span className="num text-sm text-muted">
                {inCatUnlocked} / {list.length}
              </span>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {list.map((def) => (
                <AchievementCard
                  key={def.id}
                  def={def}
                  unlockedAt={unlockedMap.get(def.id)}
                />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
