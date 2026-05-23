"use client";

import { Lock, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AchievementDef } from "@/lib/achievements-logic";

export function AchievementCard({
  def,
  unlockedAt,
}: {
  def: AchievementDef;
  unlockedAt?: string;
}) {
  const unlocked = !!unlockedAt;
  return (
    <div
      className={cn(
        "rounded-md border p-5 transition-colors",
        unlocked
          ? "panel-bright border-accent/50"
          : "panel border-border"
      )}
    >
      <div className="mb-3 flex items-center justify-between">
        <div
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-md",
            unlocked
              ? "bg-gradient-to-br from-violet to-pink text-white shadow-glow"
              : "bg-surface-2 text-muted"
          )}
        >
          {unlocked ? (
            <Trophy className="h-5 w-5" strokeWidth={2.5} />
          ) : (
            <Lock className="h-4 w-4" />
          )}
        </div>
        {def.reward_xp > 0 && (
          <span className="font-mono text-xs uppercase tracking-wider text-muted">
            +<span className="num text-accent-bright">{def.reward_xp}</span> XP
          </span>
        )}
      </div>
      <div
        className={cn(
          "display text-lg leading-tight",
          unlocked ? "text-foreground text-glow-soft" : "text-muted"
        )}
      >
        {def.name}
      </div>
      <div className="mt-1.5 text-sm text-muted">{def.description}</div>
      <div className="ornament my-3" />
      <div className="font-mono text-[11px] uppercase tracking-wider text-muted">
        Награда в жизни
      </div>
      <div
        className={cn(
          "mt-1.5 text-sm leading-snug",
          unlocked ? "text-accent-bright" : "text-foreground/60"
        )}
      >
        {def.real_reward}
      </div>
      {unlocked && (
        <div className="mt-3 font-mono text-[11px] uppercase tracking-wider text-accent">
          ◆ получено
        </div>
      )}
    </div>
  );
}
