"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useStore } from "@/lib/store";
import {
  pickMainTask,
  pickPrioritiesWithReasons,
} from "@/lib/today-logic";
import { ArrowRight, Info } from "lucide-react";
import { cn, deadlineCategory, formatDateRu } from "@/lib/utils";

export function PrioritiesList() {
  const tasks = useStore((s) => s.tasks);
  const today = new Date();
  const [showHelp, setShowHelp] = useState(false);

  const items = useMemo(() => {
    const main = pickMainTask(tasks, today);
    return pickPrioritiesWithReasons(tasks, main?.id ?? null, 5, today);
  }, [tasks, today]);

  if (items.length === 0) return null;

  return (
    <section>
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-secondary">
            ◆ Приоритеты
          </div>
          <button
            onClick={() => setShowHelp(!showHelp)}
            aria-label="как считаются"
            className="text-secondary hover:text-accent-bright"
          >
            <Info className="h-3.5 w-3.5" />
          </button>
        </div>
        <Link
          href="/tasks"
          className="flex items-center gap-1 font-mono text-xs uppercase tracking-wider text-accent-bright hover:text-pink-bright"
        >
          все задачи <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      {showHelp && (
        <div className="mb-3 rounded border border-border bg-surface-2/50 p-3 text-sm text-secondary space-y-1">
          <div className="font-mono text-xs uppercase tracking-wider text-accent-bright mb-1">
            Как считаются
          </div>
          <div>· Просроченные всегда вверху (чем дольше — тем выше)</div>
          <div>· Затем по дедлайну: сегодня → завтра → неделя → месяц</div>
          <div>· Бонус «в работе» поднимает задачу выше</div>
          <div>· Связь с активным боссом (ближайшим по дате) — приоритет</div>
          <div>· Шаг S1 (Найм) важнее S2, S3 и так далее</div>
          <div>· Снуз «Не сегодня» исключает задачу до завтра</div>
        </div>
      )}

      <ul className="space-y-1.5">
        {items.map((p) => {
          const cat = deadlineCategory(p.task.deadline, today);
          return (
            <li
              key={p.task.id}
              className="rounded border border-border bg-surface-2/40 px-3 py-2.5 hover:border-accent-dim transition-colors"
            >
              <div className="flex items-baseline justify-between gap-3">
                <div className="flex min-w-0 items-baseline gap-2">
                  <span className="num shrink-0 text-xs text-secondary">{p.task.id}</span>
                  <span className="truncate text-base text-foreground">
                    {p.task.title}
                  </span>
                </div>
                <span
                  className={cn(
                    "num shrink-0 text-xs",
                    cat === "overdue"
                      ? "text-danger-bright"
                      : cat === "week"
                        ? "text-pink-bright"
                        : "text-secondary"
                  )}
                >
                  {formatDateRu(p.task.deadline)}
                </span>
              </div>
              <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 font-mono text-[10px] uppercase tracking-wider text-secondary">
                {p.reasons.map((r, i) => (
                  <span key={i} className="text-accent-bright/80">
                    · {r}
                  </span>
                ))}
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
