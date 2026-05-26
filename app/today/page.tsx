"use client";

import { useEffect, useState } from "react";
import { CompactHeader } from "@/components/CompactHeader";
import { NowCard } from "@/components/NowCard";
import { TodayTasksCard } from "@/components/TodayTasksCard";
import { HabitsRow } from "@/components/HabitsRow";
import { EffortsRow } from "@/components/EffortsRow";
import { StreakDangerBanner } from "@/components/StreakDangerBanner";
import { RecoveryBanner } from "@/components/RecoveryBanner";
import { BehindBanner } from "@/components/BehindBanner";
import { MorningRitual } from "@/components/MorningRitual";
import { MiniXPRing } from "@/components/MiniXPRing";
import { DailyQuests } from "@/components/DailyQuests";
import { DayProgressBar } from "@/components/DayProgressBar";
import { MissionStrip } from "@/components/MissionStrip";
import { WhyCard } from "@/components/WhyCard";
import { useStore } from "@/lib/store";

export default function TodayPage() {
  const [now, setNow] = useState<Date | null>(null);
  const [manualRitualOpen, setManualRitualOpen] = useState(false);
  const dailyPlans = useStore((s) => s.dailyPlans);

  useEffect(() => {
    setNow(new Date());
    const t = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(t);
  }, []);

  if (!now) {
    return <div className="p-3 md:p-6" />;
  }

  const today = now.toISOString().slice(0, 10);
  const plan = dailyPlans.find((p) => p.date === today);

  return (
    <div className="p-3 space-y-3 md:p-6 md:space-y-4">
      <CompactHeader now={now} onOpenRitual={() => setManualRitualOpen(true)} />

      <BehindBanner />
      <StreakDangerBanner />
      <RecoveryBanner />

      {!plan?.intent && <WhyCard />}

      <MissionStrip />

      <NowCard />

      <TodayTasksCard />

      <HabitsRow />

      <EffortsRow />

      <details className="rounded-md border border-border bg-surface/40 group">
        <summary className="px-3 py-2 font-mono text-[10px] uppercase tracking-[0.2em] text-secondary cursor-pointer flex items-center justify-between hover:text-foreground">
          <span>◆ Прогресс и награды</span>
          <span className="text-muted group-open:hidden">раскрыть</span>
          <span className="text-muted hidden group-open:inline">свернуть</span>
        </summary>
        <div className="p-3 space-y-3 border-t border-border">
          <MiniXPRing />
          <DailyQuests />
        </div>
      </details>

      <DayProgressBar />

      <MorningRitual
        open={manualRitualOpen}
        onOpenChange={setManualRitualOpen}
      />
    </div>
  );
}
