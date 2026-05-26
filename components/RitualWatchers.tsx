"use client";

import { useEffect, useState } from "react";
import { useStore } from "@/lib/store";
import { MorningRitual } from "@/components/MorningRitual";
import { isRecoveryMode } from "@/components/RecoveryBanner";

const todayISO = () => new Date().toISOString().slice(0, 10);

export function RitualWatchers() {
  const dailyPlans = useStore((s) => s.dailyPlans);
  const tasks = useStore((s) => s.tasks);

  const [morningOpen, setMorningOpen] = useState(false);

  const today = todayISO();
  const plan = dailyPlans.find((p) => p.date === today);
  const planExists = !!plan;

  // Morning: open once on first visit of the day, 6:00–11:59.
  useEffect(() => {
    if (planExists) return;
    const now = new Date();
    const hour = now.getHours();
    if (hour < 6 || hour > 11) return;
    const t = setTimeout(() => setMorningOpen(true), 800);
    return () => clearTimeout(t);
  }, [planExists]);

  const recovery = isRecoveryMode(dailyPlans, tasks);
  const maxPicks = recovery ? 2 : 3;

  return (
    <MorningRitual
      open={morningOpen}
      onOpenChange={setMorningOpen}
      maxPicks={maxPicks}
    />
  );
}
