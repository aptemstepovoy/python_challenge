"use client";

import { useEffect, useRef } from "react";
import { useStore } from "@/lib/store";
import {
  dailyHabits,
  isPerfectDay,
  logForToday,
  perfectDaysStreak,
} from "@/lib/habits-logic";
import { uuid } from "@/lib/utils";
import { computeModifiers } from "@/lib/talents";

const BASE_MAX_FREEZES = 3;

export function StreakFreezeAutomation() {
  const habits = useStore((s) => s.habits);
  const habitLogs = useStore((s) => s.habitLogs);
  const streakFreezes = useStore((s) => s.streakFreezes);
  const ranRef = useRef(false);

  useEffect(() => {
    if (ranRef.current) return;
    ranRef.current = true;

    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yISO = yesterday.toISOString().slice(0, 10);

    const active = dailyHabits(habits, yesterday);
    if (active.length === 0) return;

    const anyDoneYesterday = active.some((h) =>
      logForToday(habitLogs, h.id, yISO)
    );
    if (anyDoneYesterday) return;

    const streakBefore = perfectDaysStreak(habits, habitLogs, yesterday);
    if (streakBefore < 1) return;

    if (streakFreezes <= 0) return;

    // burn 1 freeze, create frozen logs for all active daily habits yesterday
    const newLogs = active.map((h) => ({
      id: uuid(),
      habit_id: h.id,
      date: yISO,
      completed_at: new Date(yesterday).toISOString(),
      frozen: true,
    }));

    useStore.setState((s) => ({
      streakFreezes: Math.max(0, s.streakFreezes - 1),
      habitLogs: [...s.habitLogs, ...newLogs],
    }));
  }, [habits, habitLogs, streakFreezes]);

  // Earn freezes on perfect-day streak thresholds (every 7 days)
  const lastAwardRef = useRef<number | null>(null);
  useEffect(() => {
    const streak = perfectDaysStreak(habits, habitLogs);
    const tier = Math.floor(streak / 7);
    if (lastAwardRef.current === null) {
      lastAwardRef.current = tier;
      return;
    }
    if (tier > lastAwardRef.current) {
      useStore.setState((s) => {
        const mods = computeModifiers(s.talents);
        const max = BASE_MAX_FREEZES + mods.extraFreezeSlots;
        return {
          streakFreezes: Math.min(max, s.streakFreezes + 1),
          streakFreezesEarned: s.streakFreezesEarned + 1,
        };
      });
      lastAwardRef.current = tier;
    }
  }, [habits, habitLogs]);

  return null;
}

export { BASE_MAX_FREEZES };
