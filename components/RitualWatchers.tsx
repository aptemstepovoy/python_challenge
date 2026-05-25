"use client";

import { useEffect, useState } from "react";
import { useStore } from "@/lib/store";
import { MorningRitual } from "@/components/MorningRitual";
import { EveningRitual } from "@/components/EveningRitual";
import { isRecoveryMode } from "@/components/RecoveryBanner";

const todayISO = () => new Date().toISOString().slice(0, 10);

const EVENING_KEY = "operator-evening-shown";

export function RitualWatchers() {
  const dailyPlans = useStore((s) => s.dailyPlans);
  const tasks = useStore((s) => s.tasks);

  const [morningOpen, setMorningOpen] = useState(false);
  const [eveningOpen, setEveningOpen] = useState(false);
  const [tick, setTick] = useState(0);

  const today = todayISO();
  const plan = dailyPlans.find((p) => p.date === today);
  const planExists = !!plan;
  const finalized = !!plan?.finalized_at;

  // Tick every 5 min so the evening check re-runs at the boundary.
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 5 * 60 * 1000);
    return () => clearInterval(id);
  }, []);

  // Morning: open once on first visit of the day, 6:00–11:59.
  useEffect(() => {
    if (planExists) return;
    const now = new Date();
    const hour = now.getHours();
    if (hour < 6 || hour > 11) return;
    const t = setTimeout(() => setMorningOpen(true), 800);
    return () => clearTimeout(t);
  }, [planExists]);

  // Evening: if plan exists, not finalized, hour >= 19, and not shown today yet.
  useEffect(() => {
    if (!planExists || finalized) return;
    const now = new Date();
    if (now.getHours() < 19) return;
    if (typeof window === "undefined") return;
    const last = sessionStorage.getItem(EVENING_KEY);
    if (last === today) return;
    sessionStorage.setItem(EVENING_KEY, today);
    setEveningOpen(true);
  }, [planExists, finalized, today, tick]);

  const recovery = isRecoveryMode(dailyPlans, tasks);
  const maxPicks = recovery ? 2 : 3;

  return (
    <>
      <MorningRitual
        open={morningOpen}
        onOpenChange={setMorningOpen}
        maxPicks={maxPicks}
      />
      <EveningRitual open={eveningOpen} onOpenChange={setEveningOpen} />
    </>
  );
}
