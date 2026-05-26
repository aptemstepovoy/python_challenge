"use client";

import { useStore } from "@/lib/store";
import { levelFromXP, progressWithinLevel, nextLevelFromXP, xpToNextLevel } from "@/lib/xp";

export function MiniXPRing() {
  const xp = useStore((s) => s.xp);
  const lvl = levelFromXP(xp);
  const pct = progressWithinLevel(xp);
  const next = nextLevelFromXP(xp);
  const xpLeft = xpToNextLevel(xp);

  const size = 80;
  const stroke = 6;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;

  return (
    <div className="flex items-center gap-3">
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <defs>
            <linearGradient id="mini-xp" x1="0" x2="1" y1="0" y2="1">
              <stop offset="0%" stopColor="#7c5cff" />
              <stop offset="55%" stopColor="#f25fa9" />
              <stop offset="100%" stopColor="#39d6f0" />
            </linearGradient>
          </defs>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke="#181c28"
            strokeWidth={stroke}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke="url(#mini-xp)"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={`${(c * pct) / 100} ${c}`}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
            style={{ transition: "stroke-dasharray 600ms ease" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="num text-lg text-foreground leading-none">{lvl.num}</span>
          <span className="font-mono text-[8px] uppercase tracking-wider text-secondary mt-0.5">
            L
          </span>
        </div>
      </div>
      <div className="min-w-0">
        <div className="display text-base text-foreground leading-tight">
          {lvl.title}
        </div>
        <div className="font-mono text-[10px] uppercase tracking-wider text-secondary mt-0.5">
          <span className="num text-foreground">{xp.toLocaleString("ru-RU")}</span> XP
        </div>
        {next && (
          <div className="font-mono text-[10px] uppercase tracking-wider text-muted mt-0.5">
            до L{next.num}:{" "}
            <span className="num text-foreground/80">
              {xpLeft.toLocaleString("ru-RU")}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
