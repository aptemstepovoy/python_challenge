"use client";

import { useMemo } from "react";
import { useStore } from "@/lib/store";
import { initialBosses } from "@/lib/initial-data";
import { computeBossState, nearestBoss } from "@/lib/bosses-logic";
import {
  levelFromXP,
  progressWithinLevel,
} from "@/lib/xp";
import { Avatar, useAvatarState } from "@/components/Avatar";

const TITLES: Record<number, string> = {
  1: "Новичок",
  2: "Оператор",
  3: "Архитектор",
  4: "Стратег",
  5: "Свободный",
};

function GameBar({
  current,
  max,
  fill,
  glow,
}: {
  current: number;
  max: number;
  fill: string;
  glow: string;
}) {
  const pct = max > 0 ? Math.max(0, Math.min(100, (current / max) * 100)) : 0;
  return (
    <div
      className="relative h-2 overflow-hidden rounded-sm border border-black/40 bg-black/70"
      style={{ boxShadow: "inset 0 1px 0 rgba(0,0,0,0.6)" }}
    >
      <div
        className="h-full transition-[width] duration-500"
        style={{
          width: `${pct}%`,
          background: fill,
          boxShadow: `0 0 8px ${glow}, inset 0 1px 0 rgba(255,255,255,0.25)`,
        }}
      />
    </div>
  );
}

export function CharacterCard() {
  const xp = useStore((s) => s.xp);
  const tasks = useStore((s) => s.tasks);
  const habits = useStore((s) => s.habits);
  const habitLogs = useStore((s) => s.habitLogs);
  const a = useAvatarState();

  const lvl = levelFromXP(xp);
  const lvlPct = progressWithinLevel(xp);
  const xpInLevel = xp - lvl.min;
  const xpRange = Number.isFinite(lvl.max) ? lvl.max - lvl.min : 9999;

  const bossInfo = useMemo(() => {
    const states = initialBosses.map((b) =>
      computeBossState(b, tasks, habits, habitLogs)
    );
    return nearestBoss(states);
  }, [tasks, habits, habitLogs]);

  return (
    <div className="panel-hero corners relative overflow-hidden rounded-md p-3 md:p-4 h-full flex flex-col">
      <div className="pointer-events-none absolute inset-0 bg-noise opacity-60" />

      <div className="relative space-y-1.5">
        <div className="flex items-baseline justify-between">
          <div className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted">
            HP {bossInfo ? `· ${bossInfo.boss.name}` : ""}
          </div>
          <div className="num text-[11px] text-foreground/90">
            {bossInfo ? `${bossInfo.hpRemaining}/${bossInfo.boss.total_hp}` : "—"}
          </div>
        </div>
        <GameBar
          current={bossInfo ? bossInfo.hpRemaining : 0}
          max={bossInfo ? bossInfo.boss.total_hp : 1}
          fill="linear-gradient(180deg, #fca5a5 0%, #f87171 50%, #b91c1c 100%)"
          glow="rgba(248,113,113,0.5)"
        />

        <div className="flex items-baseline justify-between pt-1">
          <div className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted">
            XP · L{lvl.num}
          </div>
          <div className="num text-[11px] text-foreground/90">
            {xpInLevel}/{xpRange}
          </div>
        </div>
        <GameBar
          current={lvlPct}
          max={100}
          fill="linear-gradient(90deg, #a78bfa 0%, #ec4899 60%, #22d3ee 100%)"
          glow="rgba(167,139,250,0.55)"
        />
      </div>

      <div className="relative mt-2 flex flex-1 flex-col items-center justify-center">
        <div
          className="relative"
          style={{ filter: `drop-shadow(0 0 16px ${a.glow}99)` }}
        >
          <Avatar size={110} />
        </div>
        <div className="text-center mt-1">
          <div className="display text-base leading-none text-foreground text-glow">
            Артём
          </div>
          <div className="mt-0.5 font-mono text-[9px] uppercase tracking-[0.18em] text-muted">
            {TITLES[lvl.num]}
          </div>
        </div>
      </div>
    </div>
  );
}
