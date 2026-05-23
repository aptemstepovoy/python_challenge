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
        "rounded border p-4 transition-colors",
        unlocked
          ? "border-accent/40 bg-accent/5"
          : "border-border bg-surface"
      )}
    >
      <div className="mb-2 flex items-center justify-between">
        <div
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded",
            unlocked ? "bg-accent text-background" : "bg-surface-2 text-muted"
          )}
        >
          {unlocked ? (
            <Trophy className="h-4 w-4" strokeWidth={2.5} />
          ) : (
            <Lock className="h-4 w-4" />
          )}
        </div>
        {def.reward_xp > 0 && (
          <span className="font-mono text-[10px] uppercase tracking-wider text-muted">
            +<span className="num text-accent">{def.reward_xp}</span> XP
          </span>
        )}
      </div>
      <div
        className={cn(
          "display text-sm",
          unlocked ? "text-foreground text-glow-soft" : "text-muted"
        )}
      >
        {def.name}
      </div>
      <div className="mt-1 text-[11px] text-muted">{def.description}</div>
      <div className="ornament my-3" />
      <div className="font-mono text-[10px] uppercase tracking-wider text-muted">
        Награда в жизни
      </div>
      <div
        className={cn(
          "mt-1 text-[12px] leading-snug",
          unlocked ? "text-accent-bright" : "text-muted/80"
        )}
      >
        {def.real_reward}
      </div>
      {unlocked && (
        <div className="mt-2 font-mono text-[9px] uppercase tracking-wider text-accent/80">
          ◆ получено
        </div>
      )}
    </div>
  );
}
