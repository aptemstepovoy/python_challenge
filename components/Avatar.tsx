"use client";

import { useMemo } from "react";
import { useStore } from "@/lib/store";
import { initialBosses } from "@/lib/initial-data";
import { computeBossState } from "@/lib/bosses-logic";
import { levelFromXP } from "@/lib/xp";
import { cn } from "@/lib/utils";

type AvatarState = {
  weightTier: "heavy" | "mid" | "lean";
  cloakA: string;
  cloakB: string;
  trim: string;
  glow: string;
  level: number;
  hasCrown: boolean;
  hasGold: boolean;
  hasPalmLeaf: boolean;
  hasStaff: boolean;
  hasWings: boolean;
};

const PALETTES: Record<
  number,
  { a: string; b: string; trim: string; glow: string }
> = {
  1: { a: "#3a2e55", b: "#1c1832", trim: "#a78bfa", glow: "#a78bfa" },
  2: { a: "#5b3a8a", b: "#2a1a4a", trim: "#c4b5fd", glow: "#a78bfa" },
  3: { a: "#7c2d8a", b: "#3a1a4a", trim: "#f472b6", glow: "#ec4899" },
  4: { a: "#1e6f8a", b: "#1a3a4a", trim: "#67e8f9", glow: "#22d3ee" },
  5: { a: "#8a5a1e", b: "#4a2e1a", trim: "#fcd34d", glow: "#fbbf24" },
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

    const p = PALETTES[lvl.num] ?? PALETTES[1];

    return {
      weightTier,
      cloakA: p.a,
      cloakB: p.b,
      trim: p.trim,
      glow: p.glow,
      level: lvl.num,
      hasCrown: lvl.num >= 3,
      hasGold: naymDefeated,
      hasPalmLeaf: baliDefeated,
      hasStaff: productDefeated,
      hasWings: lvl.num >= 5,
    };
  }, [xp, kgis, tasks, habits, habitLogs]);
}

export function Avatar({
  size = 144,
  className,
}: {
  size?: number;
  className?: string;
}) {
  const s = useAvatarState();

  const bodyWidth =
    s.weightTier === "lean" ? 30 : s.weightTier === "mid" ? 40 : 52;
  const bodyHeight = 60;
  const cx = 100;
  const bodyTop = 95;

  return (
    <svg
      viewBox="0 0 200 200"
      width={size}
      height={size}
      className={cn("select-none", className)}
      aria-label="character"
    >
      <defs>
        <radialGradient id="bg-aura" cx="50%" cy="55%" r="55%">
          <stop offset="0%" stopColor={s.glow} stopOpacity="0.45" />
          <stop offset="50%" stopColor={s.glow} stopOpacity="0.12" />
          <stop offset="100%" stopColor={s.glow} stopOpacity="0" />
        </radialGradient>
        <linearGradient id="cloak-grad" x1="0" x2="0.4" y1="0" y2="1">
          <stop offset="0%" stopColor={s.cloakA} />
          <stop offset="100%" stopColor={s.cloakB} />
        </linearGradient>
        <linearGradient id="trim-grad" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%" stopColor={s.trim} stopOpacity="0.4" />
          <stop offset="50%" stopColor={s.trim} stopOpacity="1" />
          <stop offset="100%" stopColor={s.trim} stopOpacity="0.4" />
        </linearGradient>
        <radialGradient id="skin-grad" cx="40%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#fde0c8" />
          <stop offset="60%" stopColor="#e8b890" />
          <stop offset="100%" stopColor="#9a7558" />
        </radialGradient>
        <linearGradient id="hair-grad" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#2a1f33" />
          <stop offset="100%" stopColor="#0d0820" />
        </linearGradient>
        <radialGradient id="eye-grad" cx="40%" cy="40%" r="60%">
          <stop offset="0%" stopColor={s.glow} stopOpacity="1" />
          <stop offset="70%" stopColor={s.glow} stopOpacity="0.6" />
          <stop offset="100%" stopColor="#0d0820" />
        </radialGradient>
        <filter id="glow-blur" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <ellipse cx={cx} cy="105" rx="95" ry="95" fill="url(#bg-aura)" />

      {s.hasWings && (
        <g opacity="0.85">
          <path
            d={`M ${cx - 60} ${bodyTop + 5}
                Q ${cx - 95} ${bodyTop - 15} ${cx - 90} ${bodyTop + 50}
                Q ${cx - 70} ${bodyTop + 30} ${cx - 60} ${bodyTop + 5} Z`}
            fill={s.cloakA}
            opacity="0.6"
          />
          <path
            d={`M ${cx + 60} ${bodyTop + 5}
                Q ${cx + 95} ${bodyTop - 15} ${cx + 90} ${bodyTop + 50}
                Q ${cx + 70} ${bodyTop + 30} ${cx + 60} ${bodyTop + 5} Z`}
            fill={s.cloakA}
            opacity="0.6"
          />
        </g>
      )}

      <ellipse cx={cx} cy="180" rx={bodyWidth * 0.85} ry="6" fill="#000" opacity="0.5" />

      <path
        d={`M ${cx - bodyWidth - 4} ${bodyTop + 12}
            Q ${cx} ${bodyTop - 6} ${cx + bodyWidth + 4} ${bodyTop + 12}
            L ${cx + bodyWidth + 8} ${bodyTop + bodyHeight + 12}
            Q ${cx} ${bodyTop + bodyHeight + 20} ${cx - bodyWidth - 8} ${bodyTop + bodyHeight + 12}
            Z`}
        fill="url(#cloak-grad)"
        stroke={s.trim}
        strokeWidth="1.5"
        filter="url(#glow-blur)"
      />

      <path
        d={`M ${cx - bodyWidth - 4} ${bodyTop + 14}
            Q ${cx} ${bodyTop - 4} ${cx + bodyWidth + 4} ${bodyTop + 14}`}
        stroke="url(#trim-grad)"
        strokeWidth="2.5"
        fill="none"
      />

      <line
        x1={cx}
        y1={bodyTop + 14}
        x2={cx}
        y2={bodyTop + bodyHeight + 14}
        stroke={s.trim}
        strokeWidth="1.2"
        opacity="0.6"
      />

      {s.hasGold && (
        <g>
          <circle cx={cx} cy={bodyTop + 30} r="3.5" fill="#fbbf24" stroke="#fcd34d" strokeWidth="0.5" />
          <circle cx={cx - 12} cy={bodyTop + 38} r="2.5" fill="#fbbf24" />
          <circle cx={cx + 12} cy={bodyTop + 38} r="2.5" fill="#fbbf24" />
        </g>
      )}

      <ellipse cx={cx} cy="72" rx="24" ry="26" fill="url(#skin-grad)" />

      <path
        d={`M ${cx - 24} 64
            Q ${cx - 22} 36 ${cx - 5} 40
            Q ${cx + 5} 30 ${cx + 18} 40
            Q ${cx + 24} 50 ${cx + 24} 64
            L ${cx + 20} 60
            Q ${cx} 48 ${cx - 20} 60 Z`}
        fill="url(#hair-grad)"
      />

      <ellipse cx={cx - 9} cy="74" rx="3" ry="3.5" fill="url(#eye-grad)" filter="url(#glow-blur)" />
      <ellipse cx={cx + 9} cy="74" rx="3" ry="3.5" fill="url(#eye-grad)" filter="url(#glow-blur)" />
      <ellipse cx={cx - 8.5} cy="73" rx="0.9" ry="1.4" fill="#fff" opacity="0.95" />
      <ellipse cx={cx + 9.5} cy="73" rx="0.9" ry="1.4" fill="#fff" opacity="0.95" />

      <path
        d={`M ${cx - 6} 86 Q ${cx} 89 ${cx + 6} 86`}
        stroke="#7a4a3a"
        strokeWidth="1.4"
        fill="none"
        strokeLinecap="round"
      />

      <path
        d={`M ${cx - 13} 86 Q ${cx - 18} 80 ${cx - 18} 73`}
        stroke="#7a4a3a"
        strokeWidth="0.8"
        fill="none"
        opacity="0.4"
      />
      <path
        d={`M ${cx + 13} 86 Q ${cx + 18} 80 ${cx + 18} 73`}
        stroke="#7a4a3a"
        strokeWidth="0.8"
        fill="none"
        opacity="0.4"
      />

      {s.hasCrown && (
        <g filter="url(#glow-blur)">
          <path
            d={`M ${cx - 22} 48 L ${cx - 14} 34 L ${cx - 7} 42 L ${cx} 30 L ${cx + 7} 42 L ${cx + 14} 34 L ${cx + 22} 48 Z`}
            fill={s.trim}
            stroke={s.glow}
            strokeWidth="1"
          />
          <circle cx={cx} cy="38" r="2.5" fill="#f472b6" />
          <circle cx={cx - 14} cy="42" r="1.6" fill="#22d3ee" />
          <circle cx={cx + 14} cy="42" r="1.6" fill="#22d3ee" />
        </g>
      )}

      {s.hasStaff && (
        <g>
          <line
            x1={cx - bodyWidth - 14}
            y1={bodyTop - 12}
            x2={cx - bodyWidth - 14}
            y2={bodyTop + bodyHeight + 18}
            stroke="#3a2845"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <circle cx={cx - bodyWidth - 14} cy={bodyTop - 16} r="7" fill={s.glow} filter="url(#glow-blur)" />
          <circle cx={cx - bodyWidth - 14} cy={bodyTop - 16} r="3" fill="#fff" />
        </g>
      )}

      {s.hasPalmLeaf && (
        <g>
          <path
            d={`M ${cx + bodyWidth + 12} ${bodyTop - 5}
                Q ${cx + bodyWidth + 32} ${bodyTop - 28} ${cx + bodyWidth + 18} ${bodyTop - 32}
                Q ${cx + bodyWidth + 4} ${bodyTop - 12} ${cx + bodyWidth + 12} ${bodyTop - 5} Z`}
            fill="#34d399"
            stroke="#10b981"
            strokeWidth="0.8"
          />
        </g>
      )}
    </svg>
  );
}
