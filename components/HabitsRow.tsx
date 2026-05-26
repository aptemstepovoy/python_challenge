"use client";

import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import { useStore } from "@/lib/store";
import {
  todayCompletionRatio,
  visibleTodayHabits,
} from "@/lib/habits-logic";
import { Icon } from "@/components/Icon";
import { haptic } from "@/lib/haptics";
import { playHabitDone } from "@/lib/sound";
import { cn } from "@/lib/utils";

const BURST_ANGLES = [0, 60, 120, 180, 240, 300];

function Burst({ color }: { color: string }) {
  return (
    <div className="pointer-events-none absolute inset-0">
      {BURST_ANGLES.map((angle, i) => {
        const rad = (angle * Math.PI) / 180;
        return (
          <motion.span
            key={i}
            initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
            animate={{
              x: Math.cos(rad) * 32,
              y: Math.sin(rad) * 32,
              opacity: 0,
              scale: 0.3,
            }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="absolute left-1/2 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{
              background: color,
              boxShadow: `0 0 10px ${color}`,
            }}
          />
        );
      })}
    </div>
  );
}

export function HabitsRow() {
  const habits = useStore((s) => s.habits);
  const habitLogs = useStore((s) => s.habitLogs);
  const toggleHabit = useStore((s) => s.toggleHabit);

  const today = new Date();
  const visible = visibleTodayHabits(habits, habitLogs, today);
  const ratio = todayCompletionRatio(habits, habitLogs, today);

  const [celebrate, setCelebrate] = useState<{ id: string; color: string } | null>(
    null
  );

  const onTap = (id: string, color: string) => {
    haptic("success");
    playHabitDone();
    setCelebrate({ id, color });
    setTimeout(() => {
      toggleHabit(id);
      setCelebrate(null);
    }, 450);
  };

  if (visible.length === 0 && ratio.total === 0) return null;

  return (
    <section>
      <div className="flex items-center justify-between mb-2">
        <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-secondary">
          ◆ Привычки
        </div>
        <div className="flex items-baseline gap-3 font-mono text-[10px] uppercase tracking-wider">
          <span>
            <span className="num text-foreground">{ratio.done}</span>
            <span className="text-secondary"> / {ratio.total}</span>
          </span>
          <Link
            href="/habits"
            className="text-accent-bright hover:text-pink-bright"
          >
            все →
          </Link>
        </div>
      </div>
      {visible.length === 0 ? (
        <div className="text-xs text-secondary">
          Все daily-привычки закрыты сегодня 🔥
        </div>
      ) : (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {visible.map((h) => (
            <motion.button
              key={h.id}
              onClick={() => onTap(h.id, h.color)}
              whileTap={{ scale: 0.9 }}
              className={cn(
                "relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2",
                "bg-surface transition-colors"
              )}
              style={{ borderColor: h.color, color: h.color }}
              title={h.name}
              aria-label={h.name}
            >
              <Icon name={h.icon} className="h-4 w-4" />
              {celebrate?.id === h.id && <Burst color={celebrate.color} />}
            </motion.button>
          ))}
        </div>
      )}
    </section>
  );
}
