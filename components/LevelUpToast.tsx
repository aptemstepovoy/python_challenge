"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useStore } from "@/lib/store";
import { levelFromXP } from "@/lib/xp";
import { playAchievementSound } from "@/lib/sound";
import { haptic } from "@/lib/haptics";

// How long after mount we treat store changes as "hydration / catch-up"
// rather than a real level-up that deserves a celebration.
const SETTLE_MS = 2500;

export function LevelUpToast() {
  const [showLevel, setShowLevel] = useState<number | null>(null);

  useEffect(() => {
    let prev = levelFromXP(useStore.getState().xp).num;
    let primed = false;

    const settleTimer = setTimeout(() => {
      // After mount + hydration, lock in the current level as baseline.
      prev = levelFromXP(useStore.getState().xp).num;
      primed = true;
    }, SETTLE_MS);

    const unsub = useStore.subscribe((state) => {
      const cur = levelFromXP(state.xp).num;
      if (!primed) {
        // Track silently during hydration window.
        prev = cur;
        return;
      }
      if (cur > prev) {
        setShowLevel(cur);
        haptic("success");
        playAchievementSound();
      }
      prev = cur;
    });

    return () => {
      clearTimeout(settleTimer);
      unsub();
    };
  }, []);

  useEffect(() => {
    if (showLevel === null) return;
    const t = setTimeout(() => setShowLevel(null), 3800);
    return () => clearTimeout(t);
  }, [showLevel]);

  return (
    <AnimatePresence>
      {showLevel !== null && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[90] flex items-center justify-center bg-black/85 p-4"
          onClick={() => setShowLevel(null)}
        >
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse at center, rgba(167,139,250,0.4) 0%, rgba(236,72,153,0.18) 35%, transparent 70%)",
            }}
          />

          {Array.from({ length: 24 }).map((_, i) => {
            const angle = (i * 360) / 24;
            const rad = (angle * Math.PI) / 180;
            const dist = 200 + (i % 4) * 30;
            const colors = ["#a78bfa", "#ec4899", "#22d3ee", "#fbbf24"];
            return (
              <motion.span
                key={i}
                initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                animate={{
                  x: Math.cos(rad) * dist,
                  y: Math.sin(rad) * dist,
                  opacity: 0,
                  scale: 0.2,
                }}
                transition={{ duration: 2.2, ease: "easeOut", delay: 0.1 }}
                className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full"
                style={{
                  background: colors[i % colors.length],
                  boxShadow: `0 0 14px ${colors[i % colors.length]}`,
                }}
              />
            );
          })}

          <motion.div
            initial={{ scale: 0.5, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.7, opacity: 0, y: -20 }}
            transition={{ type: "spring", damping: 12, stiffness: 200 }}
            className="relative text-center"
          >
            <div className="display text-sm uppercase tracking-[0.3em] text-accent-bright">
              Новый уровень
            </div>
            <div
              className="display mt-2 leading-none text-glow"
              style={{
                fontSize: "clamp(80px, 18vw, 160px)",
                background:
                  "linear-gradient(135deg, #c4b5fd 0%, #f472b6 50%, #67e8f9 100%)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
              }}
            >
              {showLevel}
            </div>
            <div className="display mt-3 text-xl text-foreground text-glow md:text-2xl">
              {levelFromXP(useStore.getState().xp).title}
            </div>
            <div className="mt-6 font-mono text-[11px] uppercase tracking-[0.2em] text-secondary">
              тапни чтобы закрыть
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
