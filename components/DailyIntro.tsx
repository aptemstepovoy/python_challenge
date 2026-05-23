"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";
import { pickMainTask } from "@/lib/today-logic";
import { dailyHabits } from "@/lib/habits-logic";
import { levelFromXP } from "@/lib/xp";
import { daysSinceStart } from "@/lib/utils";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { Sun, Moon, Sunset } from "lucide-react";

function greeting(hour: number): { word: string; Icon: typeof Sun } {
  if (hour < 5) return { word: "Доброй ночи", Icon: Moon };
  if (hour < 12) return { word: "Доброе утро", Icon: Sun };
  if (hour < 18) return { word: "Добрый день", Icon: Sun };
  return { word: "Добрый вечер", Icon: Sunset };
}

export function DailyIntro() {
  const lastIntroDate = useStore((s) => s.lastIntroDate);
  const markIntroSeen = useStore((s) => s.markIntroSeen);
  const tasks = useStore((s) => s.tasks);
  const habits = useStore((s) => s.habits);
  const xp = useStore((s) => s.xp);

  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const today = new Date().toISOString().slice(0, 10);
    if (lastIntroDate !== today) {
      const t = setTimeout(() => setOpen(true), 350);
      return () => clearTimeout(t);
    }
  }, [mounted, lastIntroDate]);

  const today = new Date();
  const hour = today.getHours();
  const g = greeting(hour);
  const main = pickMainTask(tasks, today);
  const daily = dailyHabits(habits, today);
  const lvl = levelFromXP(xp);

  const close = () => {
    markIntroSeen();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => (o ? setOpen(true) : close())}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <g.Icon className="h-4 w-4 text-accent" />
            {g.word}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted">
            {format(today, "EEEE, d MMMM", { locale: ru })} · день {daysSinceStart(today)} / 365
          </div>

          <div className="rounded border border-border bg-surface-2 p-4">
            <div className="font-mono text-[10px] uppercase tracking-wider text-muted">
              Уровень
            </div>
            <div className="mt-1 num text-base text-foreground">
              L{lvl.num} · {lvl.title} · {xp} XP
            </div>
          </div>

          {main && (
            <div className="rounded border border-accent/40 bg-accent/5 p-4">
              <div className="font-mono text-[10px] uppercase tracking-wider text-muted">
                Главная задача сегодня
              </div>
              <div className="mt-2 num text-[10px] uppercase tracking-wider text-muted">
                {main.id}
              </div>
              <div className="text-base text-foreground">{main.title}</div>
              <div className="mt-2 font-mono text-[10px] uppercase tracking-wider text-muted">
                +<span className="num text-accent">{main.xp ?? 25}</span> XP
              </div>
            </div>
          )}

          <div>
            <div className="font-mono text-[10px] uppercase tracking-wider text-muted">
              Привычек на сегодня
            </div>
            <div className="mt-1 num text-base text-foreground">{daily.length}</div>
          </div>
        </div>

        <Button onClick={close} className="w-full">
          Открыть Today
        </Button>
      </DialogContent>
    </Dialog>
  );
}
