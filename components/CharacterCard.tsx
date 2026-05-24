"use client";

import { useMemo } from "react";
import { useStore } from "@/lib/store";
import { initialBosses } from "@/lib/initial-data";
import { computeBossState, nearestBoss } from "@/lib/bosses-logic";
import { levelFromXP, progressWithinLevel } from "@/lib/xp";
import dynamic from "next/dynamic";
import { Sparkle } from "lucide-react";

const Avatar3D = dynamic(
  () => import("@/components/Avatar3D").then((m) => m.Avatar3D),
  {
    ssr: false,
    loading: () => (
      <div className="h-full w-full animate-pulse rounded-full bg-surface-2/30" />
    ),
  }
);

/**
 * Apple-Fitness-style stacked rings.
 * Outer ring = XP within current level
 * Inner ring = nearest-boss damage progress
 */
function ProgressRings({
  xpPct,
  bossPct,
  glow,
  trim,
  size,
}: {
  xpPct: number;
  bossPct: number;
  glow: string;
  trim: string;
  size: number;
}) {
  const stroke = Math.max(6, Math.round(size * 0.04));
  const r1 = size / 2 - stroke / 2;
  const r2 = r1 - stroke - 4;
  const c1 = 2 * Math.PI * r1;
  const c2 = 2 * Math.PI * r2;
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="pointer-events-none absolute inset-0"
      style={{ filter: `drop-shadow(0 0 14px ${glow}55)` }}
    >
      <defs>
        <linearGradient id="ring-xp" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor="#a78bfa" />
          <stop offset="60%" stopColor="#ec4899" />
          <stop offset="100%" stopColor="#22d3ee" />
        </linearGradient>
        <linearGradient id="ring-boss" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor={trim} stopOpacity="0.95" />
          <stop offset="100%" stopColor={glow} stopOpacity="0.7" />
        </linearGradient>
      </defs>

      {/* XP track */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r1}
        fill="none"
        stroke="#1c1830"
        strokeWidth={stroke}
        opacity="0.7"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r1}
        fill="none"
        stroke="url(#ring-xp)"
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={`${(c1 * xpPct) / 100} ${c1}`}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ transition: "stroke-dasharray 600ms ease" }}
      />

      {/* Boss track */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r2}
        fill="none"
        stroke="#1c1830"
        strokeWidth={stroke - 2}
        opacity="0.55"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r2}
        fill="none"
        stroke="url(#ring-boss)"
        strokeWidth={stroke - 2}
        strokeLinecap="round"
        strokeDasharray={`${(c2 * bossPct) / 100} ${c2}`}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ transition: "stroke-dasharray 600ms ease" }}
      />
    </svg>
  );
}

export function CharacterCard() {
  const xp = useStore((s) => s.xp);
  const tasks = useStore((s) => s.tasks);
  const habits = useStore((s) => s.habits);
  const habitLogs = useStore((s) => s.habitLogs);
  const talentPoints = useStore((s) => s.talentPoints);

  const lvl = levelFromXP(xp);
  const lvlPct = progressWithinLevel(xp);

  const bossInfo = useMemo(() => {
    const states = initialBosses.map((b) =>
      computeBossState(b, tasks, habits, habitLogs)
    );
    return nearestBoss(states);
  }, [tasks, habits, habitLogs]);

  const bossPct = bossInfo ? Math.round(100 - bossInfo.hpPercent) : 0;

  // palette color hints for ring glow (level-aware)
  const ringGlow =
    lvl.num >= 26
      ? "#ffffff"
      : lvl.num >= 21
      ? "#c4b5fd"
      : lvl.num >= 16
      ? "#10b981"
      : lvl.num >= 11
      ? "#fbbf24"
      : lvl.num >= 7
      ? "#22d3ee"
      : lvl.num >= 4
      ? "#ec4899"
      : "#a78bfa";
  const ringTrim =
    lvl.num >= 26
      ? "#fcd34d"
      : lvl.num >= 21
      ? "#e9d5ff"
      : lvl.num >= 16
      ? "#86efac"
      : lvl.num >= 11
      ? "#fcd34d"
      : lvl.num >= 7
      ? "#67e8f9"
      : lvl.num >= 4
      ? "#f472b6"
      : "#c4b5fd";

  return (
    <div className="panel-hero corners relative overflow-hidden rounded-md p-3 md:p-4 h-full flex flex-col">
      {/* layered ambient gradient — depth */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: `radial-gradient(ellipse at 50% 40%, ${ringGlow}20 0%, transparent 60%)`,
        }}
      />
      <div className="pointer-events-none absolute inset-0 bg-noise opacity-40" />

      {talentPoints > 0 && (
        <div className="absolute right-2 top-2 z-20 flex items-center gap-1 rounded-full border border-accent-bright/70 bg-accent/25 px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-accent-bright shadow-glow animate-pulse-glow">
          <Sparkle className="h-2.5 w-2.5" strokeWidth={2.5} />
          +{talentPoints}
        </div>
      )}

      {/* top label row */}
      <div className="relative z-10 flex items-baseline justify-between">
        <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-secondary">
          L<span className="num text-accent-bright">{lvl.num}</span> ·{" "}
          <span className="text-foreground">{lvl.title}</span>
        </div>
        <div className="font-mono text-[10px] uppercase tracking-wider text-muted num">
          {Math.round(lvlPct)}%
        </div>
      </div>

      {/* Apple-style rings + 3D avatar in centre */}
      <div className="relative mt-2 flex flex-1 items-center justify-center">
        <div className="relative" style={{ width: 220, height: 220 }}>
          <ProgressRings
            xpPct={lvlPct}
            bossPct={bossPct}
            glow={ringGlow}
            trim={ringTrim}
            size={220}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <Avatar3D size={188} />
          </div>
        </div>
      </div>

      {/* bottom info row */}
      <div className="relative z-10 mt-2 flex items-end justify-between">
        <div>
          <div className="font-mono text-[9px] uppercase tracking-[0.18em] text-muted">
            Босс
          </div>
          <div className="display text-sm text-foreground text-glow leading-tight">
            {bossInfo?.boss.name ?? "—"}
          </div>
          <div className="font-mono text-[10px] text-secondary num">
            {bossPct}% побеждён
          </div>
        </div>
        <div className="text-right">
          <div className="font-mono text-[9px] uppercase tracking-[0.18em] text-muted">
            Артём
          </div>
          <div className="display text-sm text-foreground text-glow leading-tight">
            {xp.toLocaleString("ru-RU")}{" "}
            <span className="text-secondary">XP</span>
          </div>
          {Number.isFinite(lvl.max) && (
            <div className="font-mono text-[10px] text-secondary num">
              до L{lvl.num + 1}: {(lvl.max - xp).toLocaleString("ru-RU")}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
