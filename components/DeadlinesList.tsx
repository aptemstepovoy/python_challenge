"use client";

import { Badge } from "@/components/ui/badge";
import { useStore } from "@/lib/store";
import { deadlineCategory, formatDateRu } from "@/lib/utils";

const toneByCat = {
  overdue: "danger",
  week: "warn",
  month: "accent",
  later: "neutral",
} as const;

const labelByCat = {
  overdue: "Просрочено",
  week: "Эта неделя",
  month: "Этот месяц",
  later: "Позже",
} as const;

export function DeadlinesList() {
  const tasks = useStore((s) => s.tasks);

  const upcoming = tasks
    .filter((t) => t.status !== "done" && t.deadline)
    .slice()
    .sort((a, b) => a.deadline.localeCompare(b.deadline))
    .slice(0, 5);

  if (upcoming.length === 0) {
    return <div className="text-sm text-muted">Дедлайнов нет</div>;
  }

  return (
    <ul className="space-y-2">
      {upcoming.map((t) => {
        const cat = deadlineCategory(t.deadline);
        return (
          <li
            key={t.id}
            className="flex flex-col gap-2 rounded border border-border bg-surface-2 px-4 py-3 md:flex-row md:items-center md:justify-between md:gap-3"
          >
            <div className="flex min-w-0 items-baseline gap-3">
              <span className="num shrink-0 text-xs text-muted">{t.id}</span>
              <span className="truncate text-sm text-foreground">{t.title}</span>
            </div>
            <div className="flex shrink-0 items-center gap-3">
              <span className="num text-xs text-muted">
                {formatDateRu(t.deadline)}
              </span>
              <Badge tone={toneByCat[cat]}>{labelByCat[cat]}</Badge>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
