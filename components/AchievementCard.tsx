"use client";

import { Lock, Trophy, Gift } from "lucide-react";
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
      <div className="mb-4 flex items-center justify-between">
        <div
          className={cn(
            "flex h-11 w-11 items-center justify-center rounded-md",
            unlocked
              ? "bg-gradient-to-br from-violet to-pink text-white shadow-glow"
              : "bg-surface-2 text-muted"
          )}
        >
          {unlocked ? (
            <Trophy className="h-5 w-5" strokeWidth={2.5} />
          ) : (
            <Lock className="h-5 w-5" />
          )}
        </div>
        {def.reward_xp > 0 && (
          <span className="font-mono text-sm uppercase tracking-wider text-secondary">
            +<span className="num text-accent-bright text-base">{def.reward_xp}</span> XP
          </span>
        )}
      </div>
      <div
        className={cn(
          "display text-xl leading-tight",
          unlocked ? "text-foreground text-glow-soft" : "text-secondary"
        )}
      >
        {def.name}
      </div>
      <div className="mt-2 text-base leading-snug text-secondary">
        {def.description}
      </div>
      <div className="ornament my-4" />
      <div className="flex items-center gap-2 mb-1.5">
        <Gift className={cn(
          "h-4 w-4",
          unlocked ? "text-accent-bright" : "text-muted"
        )} />
        <div className="font-mono text-xs uppercase tracking-wider text-secondary">
          Награда в жизни
        </div>
      </div>
      <div
        className={cn(
          "text-base leading-snug",
          unlocked ? "text-accent-bright" : "text-secondary"
        )}
      >
        {def.real_reward}
      </div>
      {unlocked && (
        <div className="mt-3 font-mono text-sm uppercase tracking-wider text-accent-bright">
          ◆ получено
        </div>
      )}
    </div>
  );
}
