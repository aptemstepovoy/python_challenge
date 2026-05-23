"use client";

import { useEffect, useRef, useState } from "react";
import { Trophy, X, Gift } from "lucide-react";
import { useStore } from "@/lib/store";
import { ACHIEVEMENTS } from "@/lib/achievements-logic";
import { haptic } from "@/lib/haptics";
import { cn } from "@/lib/utils";
import type { AchievementId } from "@/lib/types";

type ToastItem = {
  id: string;
  achievementId: AchievementId;
};

export function AchievementToast() {
  const achievements = useStore((s) => s.achievements);
  const seenRef = useRef<Set<string>>(new Set());
  const initRef = useRef(false);
  const [queue, setQueue] = useState<ToastItem[]>([]);

  useEffect(() => {
    if (!initRef.current) {
      initRef.current = true;
      for (const a of achievements) seenRef.current.add(a.id);
      return;
    }
    const fresh: ToastItem[] = [];
    for (const a of achievements) {
      if (!seenRef.current.has(a.id)) {
        seenRef.current.add(a.id);
        fresh.push({ id: `${a.id}-${Date.now()}`, achievementId: a.id });
      }
    }
    if (fresh.length > 0) {
      haptic("success");
      setQueue((q) => [...q, ...fresh]);
    }
  }, [achievements]);

  useEffect(() => {
    if (queue.length === 0) return;
    const t = setTimeout(() => {
      setQueue((q) => q.slice(1));
    }, 6000);
    return () => clearTimeout(t);
  }, [queue]);

  if (queue.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 left-4 z-[60] flex flex-col gap-2 pointer-events-none md:left-auto md:max-w-sm">
      {queue.slice(0, 3).map((item) => {
        const def = ACHIEVEMENTS.find((a) => a.id === item.achievementId);
        if (!def) return null;
        return (
          <div
            key={item.id}
            className={cn(
              "panel-bright rounded-md p-4 pointer-events-auto",
              "animate-float-up shadow-glow-lg border-accent/50"
            )}
            onClick={() =>
              setQueue((q) => q.filter((x) => x.id !== item.id))
            }
          >
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-violet to-pink text-white shadow-glow">
                <Trophy className="h-5 w-5" strokeWidth={2.5} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-mono text-[10px] uppercase tracking-wider text-accent-bright">
                  Ачивка разблокирована
                </div>
                <div className="display text-base text-foreground mt-0.5">
                  {def.name}
                </div>
                {def.reward_xp > 0 && (
                  <div className="font-mono text-xs uppercase tracking-wider text-secondary mt-1">
                    +<span className="num text-accent-bright">{def.reward_xp}</span> XP
                  </div>
                )}
                <div className="mt-2 flex items-start gap-1.5 text-sm text-secondary">
                  <Gift className="h-3.5 w-3.5 shrink-0 text-accent-bright mt-0.5" />
                  <span>{def.real_reward}</span>
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setQueue((q) => q.filter((x) => x.id !== item.id));
                }}
                className="shrink-0 text-secondary hover:text-foreground"
                aria-label="close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
