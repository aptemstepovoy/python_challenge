"use client";

import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { useStore } from "@/lib/store";
import {
  todayCompletionRatio,
  visibleTodayHabits,
  dailyHabits,
  logForToday,
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
              x: Math.cos(rad) * 36,
              y: Math.sin(rad) * 36,
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
  const todayISO = today.toISOString().slice(0, 10);

  // Все daily-привычки за сегодня — включая уже закрытые, чтобы юзер
  // видел название и понимал что сделано.
  const dailies = dailyHabits(habits, today);
  // Weekly-привычки только если ещё в плане (не выбили норму).
  const otherVisible = visibleTodayHabits(habits, habitLogs, today).filter(
    (h) => h.frequency !== "daily"
  );
  const all = [...dailies, ...otherVisible];

  const ratio = todayCompletionRatio(habits, habitLogs, today);

  const [celebrate, setCelebrate] = useState<{ id: string; color: string } | null>(
    null
  );

  const onTap = (id: string, color: string, alreadyDone: boolean) => {
    haptic("success");
    if (!alreadyDone) {
      playHabitDone();
      setCelebrate({ id, color });
      setTimeout(() => {
        toggleHabit(id);
        setCelebrate(null);
      }, 450);
    } else {
      // отмена/перетыкание
      toggleHabit(id);
    }
  };

  if (all.length === 0) return null;

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
      <div className="flex flex-wrap gap-2">
        {all.map((h) => {
          const done = !!logForToday(habitLogs, h.id, todayISO);
          const celebrating = celebrate?.id === h.id;
          return (
            <motion.button
              key={h.id}
              onClick={() => onTap(h.id, h.color, done)}
              whileTap={{ scale: 0.95 }}
              className={cn(
                "relative flex items-center gap-2 rounded-full border-2 px-3 py-1.5 text-xs transition-colors",
                done
                  ? "border-transparent text-background"
                  : "bg-surface text-foreground"
              )}
              style={
                done
                  ? { background: h.color, borderColor: h.color }
                  : { borderColor: h.color, color: h.color }
              }
              title={h.description || h.name}
              aria-pressed={done}
            >
              {done ? (
                <Check className="h-3.5 w-3.5 shrink-0" strokeWidth={3} />
              ) : (
                <Icon name={h.icon} className="h-3.5 w-3.5 shrink-0" />
              )}
              <span
                className={cn(
                  "font-mono text-[11px] uppercase tracking-wider whitespace-nowrap",
                  done ? "text-background" : "text-foreground"
                )}
              >
                {h.name}
              </span>
              {celebrating && <Burst color={h.color} />}
            </motion.button>
          );
        })}
      </div>
    </section>
  );
}
