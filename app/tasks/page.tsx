"use client";

import { useMemo, useState } from "react";
import { StepAccordionList } from "@/components/StepAccordion";
import { Button } from "@/components/ui/button";
import { TaskItem } from "@/components/TaskItem";
import { TaskFormDialog } from "@/components/TaskFormDialog";
import { useStore } from "@/lib/store";
import {
  cn,
  isOverdue,
} from "@/lib/utils";
import { differenceInCalendarDays, parseISO } from "date-fns";
import type { Task } from "@/lib/types";
import { Plus } from "lucide-react";

type Filter =
  | "buckets"
  | "priority"
  | "by_step"
  | "overdue"
  | "all";

const PRIORITY_STEPS = ["S1", "S1.1", "S2", "S2.1", "S3", "S4"];

const filters: { key: Filter; label: string }[] = [
  { key: "buckets", label: "По срокам" },
  { key: "priority", label: "Приоритетные" },
  { key: "by_step", label: "По шагам" },
  { key: "overdue", label: "Просрочено" },
  { key: "all", label: "Все" },
];

function Section({
  title,
  tone,
  count,
  tasks,
}: {
  title: string;
  tone: "danger" | "accent" | "warn" | "muted";
  count: number;
  tasks: Task[];
}) {
  if (count === 0) return null;
  const toneClass =
    tone === "danger"
      ? "text-danger-bright"
      : tone === "accent"
        ? "text-accent-bright"
        : tone === "warn"
          ? "text-warn"
          : "text-muted";
  return (
    <section className="space-y-2">
      <div
        className={cn(
          "flex items-baseline justify-between font-mono text-[10px] uppercase tracking-[0.2em]",
          toneClass
        )}
      >
        <span>◆ {title}</span>
        <span className="num">{count}</span>
      </div>
      <div className="space-y-1">
        {tasks.map((t) => (
          <TaskItem key={t.id} task={t} />
        ))}
      </div>
    </section>
  );
}

export default function TasksPage() {
  const tasks = useStore((s) => s.tasks);
  const steps = useStore((s) => s.steps);
  const [filter, setFilter] = useState<Filter>("buckets");
  const [addOpen, setAddOpen] = useState(false);

  const buckets = useMemo(() => {
    const today = new Date();
    const todayISO = today.toISOString().slice(0, 10);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowISO = tomorrow.toISOString().slice(0, 10);

    const open = tasks.filter((t) => t.status !== "done");
    const ov = open
      .filter((t) => t.deadline < todayISO)
      .sort((a, b) => a.deadline.localeCompare(b.deadline));
    const tod = open
      .filter((t) => t.deadline === todayISO)
      .sort((a, b) => (b.xp ?? 25) - (a.xp ?? 25));
    const tom = open
      .filter((t) => t.deadline === tomorrowISO)
      .sort((a, b) => (b.xp ?? 25) - (a.xp ?? 25));
    const week = open
      .filter((t) => {
        const d = parseISO(t.deadline);
        const diff = differenceInCalendarDays(d, today);
        return diff > 1 && diff <= 7;
      })
      .sort((a, b) => a.deadline.localeCompare(b.deadline));
    const month = open
      .filter((t) => {
        const d = parseISO(t.deadline);
        const diff = differenceInCalendarDays(d, today);
        return diff > 7 && diff <= 30;
      })
      .sort((a, b) => a.deadline.localeCompare(b.deadline));
    const later = open
      .filter((t) => {
        const d = parseISO(t.deadline);
        return differenceInCalendarDays(d, today) > 30;
      })
      .sort((a, b) => a.deadline.localeCompare(b.deadline));

    return {
      overdue: ov,
      today: tod,
      tomorrow: tom,
      week,
      month,
      later,
    };
  }, [tasks]);

  const priority = useMemo(() => {
    return tasks
      .filter(
        (t) => t.status !== "done" && PRIORITY_STEPS.includes(t.step_id)
      )
      .sort((a, b) => {
        const ap = PRIORITY_STEPS.indexOf(a.step_id);
        const bp = PRIORITY_STEPS.indexOf(b.step_id);
        if (ap !== bp) return ap - bp;
        return a.deadline.localeCompare(b.deadline);
      })
      .slice(0, 20);
  }, [tasks]);

  const overdueOnly = useMemo(
    () =>
      tasks.filter(
        (t) => t.status !== "done" && isOverdue(t.deadline)
      ),
    [tasks]
  );

  return (
    <div className="p-4 space-y-6 md:p-10 md:space-y-8">
      <header className="flex flex-col gap-3 border-b border-border pb-5 md:flex-row md:items-baseline md:justify-between md:pb-6">
        <div>
          <h1 className="display text-3xl text-foreground text-glow md:text-4xl">
            Задачи
          </h1>
          <p className="mt-2 text-base text-secondary">
            Когда нужно сделать · что важно сейчас
          </p>
        </div>
        <Button onClick={() => setAddOpen(true)} className="self-start md:self-auto">
          <Plus className="mr-1.5 h-4 w-4" />
          Создать задачу
        </Button>
      </header>

      <div className="-mx-1 flex flex-wrap gap-2 px-1">
        {filters.map((f) => (
          <Button
            key={f.key}
            variant={filter === f.key ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter(f.key)}
            className="font-mono uppercase tracking-wider text-[10px]"
          >
            {f.label}
          </Button>
        ))}
      </div>

      {filter === "buckets" && (
        <div className="space-y-7">
          <Section
            title="Просрочено"
            tone="danger"
            count={buckets.overdue.length}
            tasks={buckets.overdue}
          />
          <Section
            title="Сегодня"
            tone="accent"
            count={buckets.today.length}
            tasks={buckets.today}
          />
          <Section
            title="Завтра"
            tone="warn"
            count={buckets.tomorrow.length}
            tasks={buckets.tomorrow}
          />
          <Section
            title="Эта неделя"
            tone="warn"
            count={buckets.week.length}
            tasks={buckets.week}
          />
          <Section
            title="Этот месяц"
            tone="muted"
            count={buckets.month.length}
            tasks={buckets.month}
          />
          <Section
            title="Позже"
            tone="muted"
            count={buckets.later.length}
            tasks={buckets.later}
          />
          {buckets.overdue.length === 0 &&
            buckets.today.length === 0 &&
            buckets.tomorrow.length === 0 &&
            buckets.week.length === 0 &&
            buckets.month.length === 0 &&
            buckets.later.length === 0 && (
              <div className="panel corners rounded-md p-6 text-center">
                <div className="display text-lg text-accent-bright">
                  Все задачи закрыты
                </div>
                <p className="mt-2 text-sm text-muted">
                  Добавь новых из любого шага ниже или открой /habits
                </p>
              </div>
            )}
        </div>
      )}

      {filter === "priority" && (
        <Section
          title="Приоритетные шаги (цели года)"
          tone="accent"
          count={priority.length}
          tasks={priority}
        />
      )}

      {filter === "overdue" && (
        <Section
          title="Просрочено"
          tone="danger"
          count={overdueOnly.length}
          tasks={overdueOnly}
        />
      )}

      {filter === "all" && <StepAccordionList steps={steps} tasks={tasks} />}

      {filter === "by_step" && (
        <StepAccordionList steps={steps} tasks={tasks} />
      )}

      <TaskFormDialog open={addOpen} onOpenChange={setAddOpen} />
    </div>
  );
}
