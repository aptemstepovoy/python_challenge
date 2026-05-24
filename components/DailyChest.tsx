"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Gift, Sparkles } from "lucide-react";
import { useStore } from "@/lib/store";
import { haptic } from "@/lib/haptics";
import { playAchievementSound } from "@/lib/sound";
import type { ChestReward } from "@/lib/types";
import { cn } from "@/lib/utils";

const TIER_LABEL: Record<ChestReward["tier"], string> = {
  common: "Скромная находка",
  uncommon: "Хороший день",
  rare: "Крупная удача",
  epic: "Редкая жила",
  legendary: "ЗОЛОТО ✨",
};

const TIER_COLOR: Record<ChestReward["tier"], string> = {
  common: "#a39bb8",
  uncommon: "#a78bfa",
  rare: "#22d3ee",
  epic: "#ec4899",
  legendary: "#fbbf24",
};

const todayISO = () => new Date().toISOString().slice(0, 10);

export function DailyChest() {
  const lastOpened = useStore((s) => s.lastChestOpened);
  const chestStreak = useStore((s) => s.chestStreak);
  const openChest = useStore((s) => s.openDailyChest);

  const [reveal, setReveal] = useState<ChestReward | null>(null);
  const [busy, setBusy] = useState(false);

  const available = lastOpened !== todayISO();

  const open = () => {
    if (!available || busy) return;
    setBusy(true);
    haptic("success");
    playAchievementSound();
    const reward = openChest();
    if (reward) {
      setTimeout(() => setReveal(reward), 300);
      setTimeout(() => {
        setReveal(null);
        setBusy(false);
      }, 4200);
    } else {
      setBusy(false);
    }
  };

  if (!available && !reveal) {
    return (
      <div className="panel rounded-md p-3 flex items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-surface-2 text-secondary">
          <Gift className="h-4 w-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-mono text-[11px] uppercase tracking-wider text-secondary">
            Сундук открыт
          </div>
          <div className="text-sm text-foreground/80">
            Следующий — завтра
            {chestStreak > 1 && (
              <span className="ml-2 text-accent-bright">
                · streak {chestStreak} дн.
              </span>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <motion.button
        onClick={open}
        disabled={busy}
        className={cn(
          "panel-bright corners rounded-md p-3 flex items-center gap-3 w-full text-left",
          available && "animate-pulse-glow"
        )}
        whileTap={{ scale: 0.97 }}
      >
        <motion.div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-violet via-pink to-gold text-white shadow-glow-lg"
          animate={busy ? { rotate: [0, -10, 10, -10, 10, 0] } : {}}
          transition={{ duration: 0.5 }}
        >
          <Gift className="h-5 w-5" strokeWidth={2.5} />
        </motion.div>
        <div className="flex-1 min-w-0">
          <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-accent-bright">
            ◆ Дневной сундук
          </div>
          <div className="text-sm text-foreground">
            Тапни, чтобы открыть подарок
          </div>
        </div>
        <Sparkles className="h-5 w-5 shrink-0 text-accent-bright" />
      </motion.button>

      <AnimatePresence>
        {reveal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] flex items-center justify-center bg-black/80 p-4"
            onClick={() => {
              setReveal(null);
              setBusy(false);
            }}
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.7, opacity: 0 }}
              transition={{ type: "spring", damping: 14 }}
              className="panel-hero corners rounded-md p-6 max-w-sm w-full text-center relative overflow-hidden"
              style={{
                boxShadow: `0 0 60px ${TIER_COLOR[reveal.tier]}99`,
              }}
            >
              {Array.from({ length: 16 }).map((_, i) => {
                const angle = (i * 360) / 16;
                const rad = (angle * Math.PI) / 180;
                return (
                  <motion.span
                    key={i}
                    initial={{ x: 0, y: 0, opacity: 1, scale: 0.8 }}
                    animate={{
                      x: Math.cos(rad) * 140,
                      y: Math.sin(rad) * 140,
                      opacity: 0,
                      scale: 0.2,
                    }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full"
                    style={{
                      background: TIER_COLOR[reveal.tier],
                      boxShadow: `0 0 12px ${TIER_COLOR[reveal.tier]}`,
                    }}
                  />
                );
              })}
              <div
                className="display text-sm uppercase tracking-[0.25em] mb-3"
                style={{ color: TIER_COLOR[reveal.tier] }}
              >
                {TIER_LABEL[reveal.tier]}
              </div>
              <div
                className="display text-5xl mb-2 text-glow"
                style={{ color: TIER_COLOR[reveal.tier] }}
              >
                +{reveal.xp}
              </div>
              <div className="font-mono text-sm uppercase tracking-wider text-foreground">
                XP
              </div>
              <div className="mt-4 font-mono text-[10px] uppercase tracking-wider text-secondary">
                тапни чтобы закрыть
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
