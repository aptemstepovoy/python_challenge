"use client";

import { useMemo } from "react";
import { useStore } from "@/lib/store";
import { initialBosses } from "@/lib/initial-data";
import { computeBossState } from "@/lib/bosses-logic";
import { levelFromXP } from "@/lib/xp";
import { cn } from "@/lib/utils";

type AvatarState = {
  weightTier: "heavy" | "mid" | "lean";
  cloakColor: string;
  cloakTrim: string;
  level: number;
  hasCrown: boolean;
  hasGold: boolean;
  hasPalmLeaf: boolean;
  hasStaff: boolean;
};

const CLOAK_BY_LEVEL: Record<number, { fill: string; trim: string }> = {
  1: { fill: "#3a2e1c", trim: "#5a4828" },
  2: { fill: "#4a2818", trim: "#a37e54" },
  3: { fill: "#2a3a4a", trim: "#d4a574" },
  4: { fill: "#2a4a2a", trim: "#f3c97a" },
  5: { fill: "#3a1a4a", trim: "#f3c97a" },
};

export function useAvatarState(): AvatarState {
  const xp = useStore((s) => s.xp);
  const kgis = useStore((s) => s.kgis);
  const tasks = useStore((s) => s.tasks);
  const habits = useStore((s) => s.habits);
  const habitLogs = useStore((s) => s.habitLogs);

  return useMemo(() => {
    const lvl = levelFromXP(xp);
    const weightKgi = kgis.find((k) => k.id === "weight");
    const start = Number(weightKgi?.start_value ?? 110);
    const cur = Number(weightKgi?.current_value ?? start);
    const target = 92;
    let weightTier: AvatarState["weightTier"] = "heavy";
    if (cur <= start - 12) weightTier = "lean";
    else if (cur <= start - 5) weightTier = "mid";

    const states = initialBosses.map((b) =>
      computeBossState(b, tasks, habits, habitLogs)
    );
    const naymDefeated =
      states.find((s) => s.boss.id === "naym")?.defeated ?? false;
    const baliDefeated =
      states.find((s) => s.boss.id === "bali")?.defeated ?? false;
    const productDefeated =
      states.find((s) => s.boss.id === "product")?.defeated ?? false;

    const cloak = CLOAK_BY_LEVEL[lvl.num] ?? CLOAK_BY_LEVEL[1];

    return {
      weightTier,
      cloakColor: cloak.fill,
      cloakTrim: cloak.trim,
      level: lvl.num,
      hasCrown: lvl.num >= 3,
      hasGold: naymDefeated,
      hasPalmLeaf: baliDefeated,
      hasStaff: productDefeated,
    };
  }, [xp, kgis, tasks, habits, habitLogs]);
}

export function Avatar({
  size = 160,
  className,
}: {
  size?: number;
  className?: string;
}) {
  const s = useAvatarState();

  const bodyWidth =
    s.weightTier === "lean" ? 38 : s.weightTier === "mid" ? 50 : 64;
  const bodyHeight = 70;
  const cx = 100;
  const bodyTop = 95;

  const auraOpacity = 0.08 + s.level * 0.04;

  return (
    <svg
      viewBox="0 0 200 220"
      width={size}
      height={(size * 220) / 200}
      className={cn("select-none drop-shadow-[0_0_18px_rgba(212,165,116,0.25)]", className)}
      aria-label="character"
    >
      <defs>
        <radialGradient id="aura" cx="50%" cy="55%" r="55%">
          <stop offset="0%" stopColor="#d4a574" stopOpacity={auraOpacity} />
          <stop offset="60%" stopColor="#d4a574" stopOpacity={0} />
        </radialGradient>
        <linearGradient id="cloak" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={s.cloakColor} />
          <stop offset="100%" stopColor="#0d0a07" />
        </linearGradient>
        <linearGradient id="trim" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={s.cloakTrim} />
          <stop offset="100%" stopColor="#6b4c2a" />
        </linearGradient>
        <linearGradient id="skin" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#cba889" />
          <stop offset="100%" stopColor="#8a6f54" />
        </linearGradient>
      </defs>

      <ellipse cx={cx} cy={120} rx="90" ry="95" fill="url(#aura)" />

      <ellipse cx={cx} cy={195} rx={bodyWidth * 0.9} ry="10" fill="#000" opacity="0.5" />

      <path
        d={`M ${cx - bodyWidth - 4} ${bodyTop + 10}
            Q ${cx} ${bodyTop - 6} ${cx + bodyWidth + 4} ${bodyTop + 10}
            L ${cx + bodyWidth + 10} ${bodyTop + bodyHeight + 15}
            Q ${cx} ${bodyTop + bodyHeight + 25} ${cx - bodyWidth - 10} ${bodyTop + bodyHeight + 15}
            Z`}
        fill="url(#cloak)"
        stroke={s.cloakTrim}
        strokeWidth="1.5"
      />

      <path
        d={`M ${cx - bodyWidth - 4} ${bodyTop + 12}
            Q ${cx} ${bodyTop - 4} ${cx + bodyWidth + 4} ${bodyTop + 12}`}
        stroke="url(#trim)"
        strokeWidth="2.5"
        fill="none"
      />

      <rect
        x={cx - 1.5}
        y={bodyTop + 14}
        width="3"
        height={bodyHeight + 5}
        fill={s.cloakTrim}
        opacity="0.5"
      />

      {s.hasGold && (
        <>
          <circle cx={cx} cy={bodyTop + 32} r="3" fill="#f3c97a" />
          <circle cx={cx - 10} cy={bodyTop + 40} r="2" fill="#d4a574" />
          <circle cx={cx + 10} cy={bodyTop + 40} r="2" fill="#d4a574" />
        </>
      )}

      <circle cx={cx} cy="70" r="26" fill="url(#skin)" stroke="#6b4c2a" strokeWidth="1" />

      <path
        d={`M ${cx - 26} 64
            Q ${cx - 14} 38 ${cx} 42
            Q ${cx + 14} 38 ${cx + 26} 64
            L ${cx + 22} 60
            Q ${cx} 50 ${cx - 22} 60 Z`}
        fill="#1a1410"
      />

      <ellipse cx={cx - 9} cy="73" rx="2.2" ry="2.8" fill="#1a1410" />
      <ellipse cx={cx + 9} cy="73" rx="2.2" ry="2.8" fill="#1a1410" />
      <ellipse cx={cx - 8.5} cy="72" rx="0.8" ry="1.2" fill="#f3c97a" />
      <ellipse cx={cx + 9.5} cy="72" rx="0.8" ry="1.2" fill="#f3c97a" />

      <path
        d={`M ${cx - 5} 84 Q ${cx} 87 ${cx + 5} 84`}
        stroke="#5a3a22"
        strokeWidth="1.4"
        fill="none"
        strokeLinecap="round"
      />

      {s.hasCrown && (
        <g>
          <path
            d={`M ${cx - 22} 48 L ${cx - 14} 36 L ${cx - 7} 44 L ${cx} 32 L ${cx + 7} 44 L ${cx + 14} 36 L ${cx + 22} 48 Z`}
            fill="url(#trim)"
            stroke="#6b4c2a"
            strokeWidth="0.8"
          />
          <circle cx={cx} cy="40" r="2" fill="#e36767" />
          <circle cx={cx - 14} cy="44" r="1.4" fill="#7e6cd4" />
          <circle cx={cx + 14} cy="44" r="1.4" fill="#7e6cd4" />
        </g>
      )}

      {s.hasStaff && (
        <g>
          <line
            x1={cx - bodyWidth - 16}
            y1={bodyTop - 10}
            x2={cx - bodyWidth - 16}
            y2={bodyTop + bodyHeight + 18}
            stroke="#5a3a22"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <circle cx={cx - bodyWidth - 16} cy={bodyTop - 14} r="6" fill="url(#trim)" />
          <circle cx={cx - bodyWidth - 16} cy={bodyTop - 14} r="2.5" fill="#7e6cd4" />
        </g>
      )}

      {s.hasPalmLeaf && (
        <g>
          <path
            d={`M ${cx + bodyWidth + 14} ${bodyTop - 5}
                Q ${cx + bodyWidth + 30} ${bodyTop - 25} ${cx + bodyWidth + 18} ${bodyTop - 30}
                Q ${cx + bodyWidth + 6} ${bodyTop - 12} ${cx + bodyWidth + 14} ${bodyTop - 5} Z`}
            fill="#5a9b6a"
            stroke="#3a6b48"
            strokeWidth="0.8"
          />
        </g>
      )}
    </svg>
  );
}
