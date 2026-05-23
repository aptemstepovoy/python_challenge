"use client";

import { useEffect, useState } from "react";
import { StreakChips } from "@/components/StreakChips";
import { TodayFocus } from "@/components/TodayFocus";
import { useStore } from "@/lib/store";
import { daysSinceStart, formatWeekday } from "@/lib/utils";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

function greeting(hour: number): string {
  if (hour < 5) return "Ночи";
  if (hour < 12) return "Утра";
  if (hour < 18) return "Дня";
  return "Вечера";
}

export default function TodayPage() {
  const [now, setNow] = useState<Date | null>(null);
  const tasks = useStore((s) => s.tasks);

  useEffect(() => {
    setNow(new Date());
    const t = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(t);
  }, []);

  const open = tasks.filter((t) => t.status !== "done").length;
  const inProgress = tasks.filter((t) => t.status === "in_progress").length;

  return (
    <div className="p-4 space-y-5 md:p-10 md:space-y-8">
      <header className="border-b border-border pb-5 md:pb-6">
        <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
          {now ? format(now, "EEEE, d MMMM", { locale: ru }) : ""}
        </div>
        <h1 className="mt-2 font-mono text-2xl tracking-wider text-foreground md:text-3xl">
          {now ? greeting(now.getHours()) : "—"}
        </h1>
        <div className="mt-3 flex items-baseline gap-4">
          <span className="num text-xs text-muted">
            День <span className="text-foreground">{now ? daysSinceStart(now) : 0}</span> / 365
          </span>
          <span className="num text-xs text-muted">
            Открытых задач <span className="text-foreground">{open}</span>
          </span>
          <span className="num text-xs text-muted">
            В работе <span className="text-foreground">{inProgress}</span>
          </span>
        </div>
      </header>

      <section>
        <StreakChips />
      </section>

      <TodayFocus />
    </div>
  );
}
