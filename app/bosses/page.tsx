"use client";

import { useStore } from "@/lib/store";
import { initialBosses } from "@/lib/initial-data";
import { computeBossState } from "@/lib/bosses-logic";
import { BossCard } from "@/components/BossCard";

export default function BossesPage() {
  const tasks = useStore((s) => s.tasks);
  const habits = useStore((s) => s.habits);
  const habitLogs = useStore((s) => s.habitLogs);

  const states = initialBosses.map((b) =>
    computeBossState(b, tasks, habits, habitLogs)
  );

  return (
    <div className="p-4 space-y-6 md:p-10 md:space-y-8">
      <header className="border-b border-border pb-5 md:pb-6">
        <h1 className="font-mono text-xl tracking-wider text-foreground md:text-2xl">
          Боссы
        </h1>
        <p className="mt-1 text-sm text-muted">
          Главные противники года · урон копится от задач и привычек
        </p>
      </header>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {states.map((s) => (
          <BossCard key={s.boss.id} state={s} />
        ))}
      </div>
    </div>
  );
}
