"use client";

import { useMemo } from "react";
import { differenceInCalendarDays, parseISO } from "date-fns";
import { Plus, Target } from "lucide-react";
import { useStore } from "@/lib/store";
import { haptic } from "@/lib/haptics";
import { cn } from "@/lib/utils";

export function EffortsToday() {
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

  const rows = active.map((e) => {
    const weekLogs = effortLogs.filter(
      (l) =>
        l.effort_id === e.id &&
        differenceInCalendarDays(today, parseISO(l.date)) < 7
    );
    const target = e.target_per_week ?? 1;
    return { effort: e, done: weekLogs.length, target };
  });

  return (
    <div className="panel corners rounded-md p-3 md:p-4">
      <div className="flex items-center gap-2 mb-2 font-mono text-[10px] uppercase tracking-[0.18em] text-secondary">
        <Target className="h-3 w-3" />
        Регулярные усилия · неделя
      </div>
      <div className="space-y-1.5">
        {rows.map(({ effort, done, target }) => {
          const pct = Math.min(100, Math.round((done / target) * 100));
          const full = done >= target;
          return (
            <div
              key={effort.id}
              className="flex items-center gap-2.5 rounded-md border border-border bg-surface px-3 py-2"
            >
              <div className="flex-1 min-w-0">
                <div className="text-sm text-foreground truncate">
                  {effort.title}
                </div>
                <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-surface-2">
                  <div
                    className={cn(
                      "h-full transition-all",
                      full ? "bg-ok-bright" : "bg-accent"
                    )}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
              <div className="shrink-0 num text-xs">
                <span className={full ? "text-ok-bright" : "text-foreground"}>
                  {done}
                </span>
                <span className="text-secondary"> / {target}</span>
              </div>
              <button
                onClick={() => {
                  haptic("success");
                  logEffort(effort.id);
                }}
                className="shrink-0 flex h-7 w-7 items-center justify-center rounded-md border border-accent-dim bg-accent/10 text-accent-bright hover:bg-accent/20"
                title="+1"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
