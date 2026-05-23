"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import { buildHeatmap } from "@/lib/habits-logic";
import { cn } from "@/lib/utils";
import { format, parseISO } from "date-fns";
import { ru } from "date-fns/locale";

function cellTone(ratio: number, hasData: boolean): string {
  if (!hasData) return "bg-transparent";
  if (ratio === 0) return "bg-surface-2";
  if (ratio < 0.25) return "bg-accent/15";
  if (ratio < 0.5) return "bg-accent/30";
  if (ratio < 0.75) return "bg-accent/55";
  return "bg-accent/85";
}

const DOW = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

export function HabitHeatmap() {
  const habits = useStore((s) => s.habits);
  const habitLogs = useStore((s) => s.habitLogs);
  const cols = buildHeatmap(habits, habitLogs, 12);
  const [hover, setHover] = useState<{
    date: string;
    ratio: number;
    done: number;
    total: number;
  } | null>(null);

  return (
    <div className="rounded border border-border bg-surface p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="font-mono text-[11px] uppercase tracking-[0.15em] text-muted">
          История · 12 недель
        </div>
        {hover && (
          <div className="font-mono text-[10px] uppercase tracking-wider text-muted">
            {format(parseISO(hover.date), "d MMM yyyy", { locale: ru })} ·{" "}
            <span className="num text-foreground">
              {hover.done}/{hover.total}
            </span>
          </div>
        )}
      </div>
      <div className="flex gap-1 overflow-x-auto pb-1">
        <div className="flex flex-col gap-1 pr-2">
          {DOW.map((d, i) => (
            <div
              key={d}
              className={cn(
                "h-3 font-mono text-[9px] uppercase tracking-wider text-muted/60 leading-3",
                i % 2 === 0 ? "" : "opacity-0"
              )}
            >
              {d}
            </div>
          ))}
        </div>
        {cols.map((col, ci) => (
          <div key={ci} className="flex flex-col gap-1">
            {col.map((cell) => (
              <div
                key={cell.date}
                onMouseEnter={() =>
                  setHover({
                    date: cell.date,
                    ratio: cell.ratio,
                    done: cell.doneCount,
                    total: cell.total,
                  })
                }
                onMouseLeave={() => setHover(null)}
                className={cn(
                  "h-3 w-3 shrink-0 rounded-sm",
                  cellTone(cell.ratio, cell.total > 0)
                )}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
