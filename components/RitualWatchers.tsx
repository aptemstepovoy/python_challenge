"use client";

import { useEffect, useState } from "react";
import { useStore } from "@/lib/store";
import { MorningRitual } from "@/components/MorningRitual";

const todayISO = () => new Date().toISOString().slice(0, 10);

export function RitualWatchers() {
  const dailyPlans = useStore((s) => s.dailyPlans);

  const [morningOpen, setMorningOpen] = useState(false);

  const today = todayISO();
  const plan = dailyPlans.find((p) => p.date === today);
  const planExists = !!plan;

  // Morning ritual: opens once on first visit of the day between 6 and 12.
  useEffect(() => {
    if (planExists) return;
    const now = new Date();
    const hour = now.getHours();
    if (hour < 6 || hour > 11) return;
    const t = setTimeout(() => setMorningOpen(true), 800);
    return () => clearTimeout(t);
  }, [planExists]);

  return (
    <MorningRitual
      open={morningOpen}
      onOpenChange={setMorningOpen}
      maxPicks={3}
    />
  );
}
