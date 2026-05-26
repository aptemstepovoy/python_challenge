"use client";

import { useMemo } from "react";
import { differenceInCalendarDays, parseISO } from "date-fns";
import { Plus, Target } from "lucide-react";
import { useStore } from "@/lib/store";
import { haptic } from "@/lib/haptics";
import { cn } from "@/lib/utils";

export function EffortsRow() {
  const efforts = useStore((s) => s.efforts);
  const effortLogs = useStore((s) => s.effortLogs);
  const logEffort = useStore((s) => s.logEffort);
  const today = useMemo(() => new Date(), []);
  const todayISO = today.toISOString().slice(0, 10);

  const active = useMemo(() => {
    return efforts.filter((e) => {
      if (e.archived) return false;
      if (e.start_date > todayISO) return false;
      if (e.end_date < todayISO) return false;
      return true;
    });
  }, [efforts, todayISO]);

  if (active.length === 0) return null;

  return (
    <section>
      <div className="flex items-center gap-2 mb-2 font-mono text-[10px] uppercase tracking-[0.2em] text-secondary">
        <Target className="h-3 w-3" />
        Регулярные усилия · неделя
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {active.map((e) => {
          const weekDone = effortLogs.filter(
            (l) =>
              l.effort_id === e.id &&
              differenceInCalendarDays(today, parseISO(l.date)) < 7
          ).length;
          const target = e.target_per_week ?? 1;
          const full = weekDone >= target;
          return (
            <button
              key={e.id}
              onClick={() => {
                haptic("success");
                logEffort(e.id);
              }}
              className={cn(
                "shrink-0 flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs transition-colors",
                full
                  ? "border-ok-bright/50 bg-ok/10 text-ok-bright"
                  : "border-border bg-surface text-foreground hover:border-accent-dim"
              )}
            >
              <span className="truncate max-w-[140px]">{e.title}</span>
              <span className="font-mono num text-[10px] text-secondary">
                {weekDone}/{target}
              </span>
              <Plus
                className={cn(
                  "h-3 w-3 shrink-0",
                  full ? "text-ok-bright/60" : "text-accent-bright"
                )}
              />
            </button>
          );
        })}
      </div>
    </section>
  );
}
