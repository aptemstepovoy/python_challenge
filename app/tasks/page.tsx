"use client";

import { useMemo, useState } from "react";
import { StepAccordionList } from "@/components/StepAccordion";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";
import { cn, isOverdue, isThisMonth, isThisWeek } from "@/lib/utils";

type Filter = "all" | "overdue" | "week" | "month" | "active";

const ACTIVE_STEPS = ["S1", "S1.1", "S2", "S2.1", "S3"];

const filters: { key: Filter; label: string }[] = [
  { key: "all", label: "Все" },
  { key: "overdue", label: "Просрочено" },
  { key: "week", label: "Эта неделя" },
  { key: "month", label: "Этот месяц" },
  { key: "active", label: "Активные шаги" },
];

export default function TasksPage() {
  const tasks = useStore((s) => s.tasks);
  const steps = useStore((s) => s.steps);
  const [filter, setFilter] = useState<Filter>("all");

  const filteredTasks = useMemo(() => {
    switch (filter) {
      case "all":
        return tasks;
      case "overdue":
        return tasks.filter((t) => t.status !== "done" && isOverdue(t.deadline));
      case "week":
        return tasks.filter(
          (t) => t.status !== "done" && isThisWeek(t.deadline)
        );
      case "month":
        return tasks.filter(
          (t) => t.status !== "done" && isThisMonth(t.deadline)
        );
      case "active":
        return tasks.filter((t) => ACTIVE_STEPS.includes(t.step_id));
    }
  }, [filter, tasks]);

  const visibleSteps = useMemo(() => {
    if (filter === "active") return steps.filter((s) => ACTIVE_STEPS.includes(s.id));
    const stepIds = new Set(filteredTasks.map((t) => t.step_id));
    if (filter === "all") return steps;
    return steps.filter((s) => stepIds.has(s.id));
  }, [filter, filteredTasks, steps]);

  return (
    <div className="p-10 space-y-6">
      <header className="border-b border-border pb-6">
        <h1 className="font-mono text-2xl tracking-wider text-foreground">
          Задачи плана
        </h1>
        <p className="mt-1 text-sm text-muted">
          Step-структура · группировка по этапам
        </p>
      </header>

      <div className="flex flex-wrap gap-2">
        {filters.map((f) => (
          <Button
            key={f.key}
            variant={filter === f.key ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter(f.key)}
            className={cn(
              "font-mono uppercase tracking-wider text-[11px]"
            )}
          >
            {f.label}
          </Button>
        ))}
      </div>

      {visibleSteps.length === 0 ? (
        <div className="rounded border border-border bg-surface p-8 text-center text-sm text-muted">
          Под фильтр ничего не попало
        </div>
      ) : (
        <StepAccordionList steps={visibleSteps} tasks={filteredTasks} />
      )}
    </div>
  );
}
