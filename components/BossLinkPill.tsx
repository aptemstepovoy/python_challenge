"use client";

import { Crosshair } from "lucide-react";
import { initialBosses } from "@/lib/initial-data";
import { cn } from "@/lib/utils";

const BOSS_TINT: Record<string, string> = {
  naym: "text-cyan-bright border-cyan/40 bg-cyan/5",
  telo: "text-pink-bright border-pink/40 bg-pink/5",
  bali: "text-gold-bright border-gold/40 bg-gold/5",
  product: "text-accent-bright border-accent/40 bg-accent/5",
};

export function BossLinkPill({
  bossId,
  className,
}: {
  bossId?: string | null;
  className?: string;
}) {
  if (!bossId) return null;
  const boss = initialBosses.find((b) => b.id === bossId);
  if (!boss) return null;
  const tint = BOSS_TINT[bossId] ?? "text-secondary border-border bg-surface";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider",
        tint,
        className
      )}
    >
      <Crosshair className="h-2.5 w-2.5" />
      {boss.name}
    </span>
  );
}
