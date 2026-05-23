"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useStore } from "@/lib/store";
import { pickMainTask, pickTopPriorities } from "@/lib/today-logic";
import { ArrowRight } from "lucide-react";
import { cn, deadlineCategory, formatDateRu } from "@/lib/utils";

export function PrioritiesList() {
  const tasks = useStore((s) => s.tasks);
  const today = new Date();

  const items = useMemo(() => {
    const main = pickMainTask(tasks, today);
    return pickTopPriorities(tasks, main?.id ?? null, 3, today);
  }, [tasks, today]);

  if (items.length === 0) return null;

  return (
    <section>
      <div className="mb-3 flex items-baseline justify-between">
        <div className="font-mono text-[11px] uppercase tracking-[0.15em] text-muted">
          Приоритеты
        </div>
        <Link
          href="/tasks"
          className="flex items-center gap-1 font-mono text-[10px] uppercase tracking-wider text-accent"
        >
          все задачи <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
      <ul className="space-y-1.5">
        {items.map((t) => {
          const cat = deadlineCategory(t.deadline, today);
          return (
            <li
              key={t.id}
              className="flex items-baseline justify-between gap-3 rounded border border-transparent py-1.5 hover:border-border hover:bg-surface-2 px-2"
            >
              <div className="flex min-w-0 items-baseline gap-2">
                <span className="num shrink-0 text-[11px] text-muted">→</span>
                <span className="num shrink-0 text-[11px] text-muted">{t.id}</span>
                <span className="truncate text-sm text-foreground">{t.title}</span>
              </div>
              <span
                className={cn(
                  "num shrink-0 text-[11px]",
                  cat === "overdue"
                    ? "text-danger"
                    : cat === "week"
                      ? "text-warn"
                      : "text-muted"
                )}
              >
                {formatDateRu(t.deadline)}
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
