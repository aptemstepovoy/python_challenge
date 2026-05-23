"use client";

import { useMemo } from "react";
import { useStore } from "@/lib/store";
import { initialBosses } from "@/lib/initial-data";
import { computeBossState, nearestBoss } from "@/lib/bosses-logic";
import {
  levelFromXP,
  progressWithinLevel,
  xpToNextLevel,
} from "@/lib/xp";
import { Avatar, useAvatarState } from "@/components/Avatar";
import { CountUp } from "@/components/CountUp";
import { cn } from "@/lib/utils";

function Bar({
  label,
  current,
  max,
  tone,
  unit,
}: {
  label: string;
  current: number;
  max: number;
  tone: "hp" | "xp";
  unit?: string;
}) {
  const pct = max > 0 ? Math.max(0, Math.min(100, (current / max) * 100)) : 0;
  return (
    <div className="space-y-1">
      <div className="flex items-baseline justify-between font-mono text-[9px] uppercase tracking-[0.15em]">
        <span className={tone === "hp" ? "text-danger-bright" : "text-accent-bright"}>
          {label}
        </span>
        <span className="num text-foreground/90">
          <CountUp value={current} duration={500} />
          {unit ? ` ${unit}` : ""} / {max}
        </span>
      </div>
      <div
        className={cn(
          "relative h-2 overflow-hidden rounded-sm",
          "bg-black/60",
          "border border-black/40"
        )}
        style={{ boxShadow: "inset 0 1px 0 rgba(0,0,0,0.5)" }}
      >
        <div
          className="h-full transition-[width] duration-500"
          style={{
            width: `${pct}%`,
            background:
              tone === "hp"
                ? "linear-gradient(180deg, #e36767 0%, #c44545 50%, #7a2424 100%)"
                : "linear-gradient(180deg, #f3c97a 0%, #d4a574 50%, #8a6432 100%)",
            boxShadow:
              tone === "hp"
                ? "0 0 8px rgba(228,103,103,0.45), inset 0 1px 0 rgba(255,255,255,0.15)"
                : "0 0 10px rgba(243,201,122,0.5), inset 0 1px 0 rgba(255,255,255,0.2)",
          }}
        />
      </div>
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
  const toNext = xpToNextLevel(xp);

  const bossInfo = useMemo(() => {
    const states = initialBosses.map((b) =>
      computeBossState(b, tasks, habits, habitLogs)
    );
    const target = nearestBoss(states);
    return target;
  }, [tasks, habits, habitLogs]);

  const titleByLevel: Record<number, string> = {
    1: "Новичок",
    2: "Оператор",
    3: "Архитектор",
    4: "Стратег",
    5: "Свободный",
  };

  return (
    <div className="relative panel-bright corners overflow-hidden p-5 md:p-7">
      <div className="pointer-events-none absolute inset-0 bg-vignette opacity-60" />

      <div className="relative flex flex-col items-center gap-4 md:flex-row md:items-center md:gap-7">
        <div className="shrink-0">
          <Avatar size={150} />
        </div>

        <div className="w-full flex-1 space-y-4">
          <div className="text-center md:text-left">
            <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted">
              Уровень {lvl.num} ·{" "}
              <span className="text-accent-bright">{titleByLevel[lvl.num]}</span>
            </div>
            <div className="display mt-1 text-2xl text-foreground text-glow md:text-3xl">
              Артём
            </div>
          </div>

          {bossInfo && (
            <Bar
              label={`Цель — ${bossInfo.boss.name}`}
              current={bossInfo.hpRemaining}
              max={bossInfo.boss.total_hp}
              tone="hp"
              unit="HP"
            />
          )}

          <Bar label="Опыт" current={xp} max={lvl.min + (lvl.max === Infinity ? 9999 : lvl.max - lvl.min)} tone="xp" />

          <div className="flex flex-wrap justify-between gap-2 font-mono text-[10px] uppercase tracking-wider text-muted">
            <span>
              до уровня <span className="num text-accent">{toNext}</span> XP
            </span>
            <span>
              {a.weightTier === "lean"
                ? "тонкий силуэт"
                : a.weightTier === "mid"
                  ? "в форме"
                  : "стартовая форма"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
