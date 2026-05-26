"use client";

import { useEffect, useState } from "react";
import { CompactHeader } from "@/components/CompactHeader";
import { NowCard } from "@/components/NowCard";
import { TodayTasksCard } from "@/components/TodayTasksCard";
import { HabitsRow } from "@/components/HabitsRow";
import { MorningRitual } from "@/components/MorningRitual";

export default function TodayPage() {
  const [now, setNow] = useState<Date | null>(null);
  const [ritualOpen, setRitualOpen] = useState(false);

  useEffect(() => {
    setNow(new Date());
    const t = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(t);
  }, []);

  if (!now) return <div className="p-4 md:p-6" />;

  return (
    <div className="p-4 space-y-5 md:p-6 md:space-y-6 max-w-2xl mx-auto">
      <CompactHeader now={now} onOpenRitual={() => setRitualOpen(true)} />
      <NowCard />
      <TodayTasksCard />
      <HabitsRow />
      <MorningRitual open={ritualOpen} onOpenChange={setRitualOpen} />
    </div>
  );
}
