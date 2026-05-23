"use client";

import { useMemo, useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { StepAccordionList } from "@/components/StepAccordion";
import { Button } from "@/components/ui/button";
import { TaskItem } from "@/components/TaskItem";
import { TaskFormDialog } from "@/components/TaskFormDialog";
import { useStore } from "@/lib/store";
import { cn, isOverdue } from "@/lib/utils";
import {
  addDays,
  differenceInCalendarDays,
  endOfMonth,
  endOfWeek,
  parseISO,
} from "date-fns";
import type { Task } from "@/lib/types";
import { Plus } from "lucide-react";

type Filter = "buckets" | "priority" | "by_step" | "overdue" | "all";

const PRIORITY_STEPS = ["S1", "S1.1", "S2", "S2.1", "S3", "S4"];

const filters: { key: Filter; label: string }[] = [
  { key: "buckets", label: "По срокам" },
  { key: "priority", label: "Приоритетные" },
  { key: "by_step", label: "По шагам" },
  { key: "overdue", label: "Просрочено" },
  { key: "all", label: "Все" },
];

function Bucket({
  id,
  title,
  tone,
  tasks,
}: {
  id: string;
  title: string;
  tone: "danger" | "accent" | "warn" | "muted";
  tasks: Task[];
}) {
  const toneClass =
    tone === "danger"
      ? "text-danger-bright"
      : tone === "accent"
        ? "text-accent-bright"
        : tone === "warn"
          ? "text-pink-bright"
          : "text-secondary";
  return (
    <AccordionItem value={id}>
      <AccordionTrigger>
        <div className="flex w-full items-center gap-4 pr-3">
          <span
            className={cn(
              "font-mono text-sm uppercase tracking-[0.18em]",
              toneClass
            )}
          >
            ◆ {title}
          </span>
          <span className="flex-1" />
          <span className={cn("num text-sm", toneClass)}>
            {tasks.length}
          </span>
        </div>
      </AccordionTrigger>
      <AccordionContent>
        {tasks.length === 0 ? (
          <div className="py-3 text-base text-secondary">Задач нет</div>
        ) : (
          <div className="space-y-1">
            {tasks.map((t) => (
              <TaskItem key={t.id} task={t} />
            ))}
          </div>
        )}
      </AccordionContent>
    </AccordionItem>
  );
}

function PriorityAccordion({
  title,
  tasks,
}: {
  title: string;
  tasks: Task[];
}) {
  return (
    <AccordionItem value={`prio-${title}`}>
      <AccordionTrigger>
        <div className="flex w-full items-center gap-4 pr-3">
          <span className="font-mono text-sm uppercase tracking-[0.18em] text-accent-bright">
            ◆ {title}
          </span>
          <span className="flex-1" />
          <span className="num text-sm text-secondary">{tasks.length}</span>
        </div>
      </AccordionTrigger>
      <AccordionContent>
        {tasks.length === 0 ? (
          <div className="py-3 text-base text-secondary">Задач нет</div>
        ) : (
          <div className="space-y-1">
            {tasks.map((t) => (
              <TaskItem key={t.id} task={t} />
            ))}
          </div>
        )}
      </AccordionContent>
    </AccordionItem>
  );
}

export default function TasksPage() {
  const tasks = useStore((s) => s.tasks);
  const steps = useStore((s) => s.steps);
  const [filter, setFilter] = useState<Filter>("buckets");
  const [addOpen, setAddOpen] = useState(false);

  const buckets = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayISO = today.toISOString().slice(0, 10);
    const weekEnd = endOfWeek(today, { weekStartsOn: 1 });
    const monthEnd = endOfMonth(today);
    const q3End = addDays(today, 90);
    const m6End = addDays(today, 180);
    const yearEnd = addDays(today, 365);

    const open = tasks.filter((t) => t.status !== "done");

    const overdue = open
      .filter((t) => t.deadline < todayISO)
      .sort((a, b) => a.deadline.localeCompare(b.deadline));

    const todayList = open
      .filter((t) => t.deadline === todayISO)
      .sort((a, b) => (b.xp ?? 25) - (a.xp ?? 25));

    const week = open
      .filter((t) => {
        const d = parseISO(t.deadline);
        return d > today && d <= weekEnd;
      })
      .sort((a, b) => a.deadline.localeCompare(b.deadline));

    const month = open
      .filter((t) => {
        const d = parseISO(t.deadline);
        return d > weekEnd && d <= monthEnd;
      })
      .sort((a, b) => a.deadline.localeCompare(b.deadline));

    const q3 = open
      .filter((t) => {
        const d = parseISO(t.deadline);
        return d > monthEnd && d <= q3End;
      })
      .sort((a, b) => a.deadline.localeCompare(b.deadline));

    const m6 = open
      .filter((t) => {
        const d = parseISO(t.deadline);
        return d > q3End && d <= m6End;
      })
      .sort((a, b) => a.deadline.localeCompare(b.deadline));

    const year = open
      .filter((t) => {
        const d = parseISO(t.deadline);
        return d > m6End && d <= yearEnd;
      })
      .sort((a, b) => a.deadline.localeCompare(b.deadline));

    const later = open
      .filter((t) => parseISO(t.deadline) > yearEnd)
      .sort((a, b) => a.deadline.localeCompare(b.deadline));

    return { overdue, today: todayList, week, month, q3, m6, year, later };
  }, [tasks]);

  const totalOpen =
    buckets.overdue.length +
    buckets.today.length +
    buckets.week.length +
    buckets.month.length +
    buckets.q3.length +
    buckets.m6.length +
    buckets.year.length +
    buckets.later.length;

  const priorityByStep = useMemo(() => {
    const map: Record<string, Task[]> = {};
    for (const t of tasks) {
      if (t.status === "done") continue;
      if (!PRIORITY_STEPS.includes(t.step_id)) continue;
      (map[t.step_id] ??= []).push(t);
    }
    for (const k of Object.keys(map)) {
      map[k].sort((a, b) => a.deadline.localeCompare(b.deadline));
    }
    return map;
  }, [tasks]);

  const overdueOnly = useMemo(
    () =>
      tasks
        .filter((t) => t.status !== "done" && isOverdue(t.deadline))
        .sort((a, b) => a.deadline.localeCompare(b.deadline)),
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
            className="font-mono uppercase tracking-wider text-xs"
          >
            {f.label}
          </Button>
        ))}
      </div>

      {filter === "buckets" && (
        <div>
          {totalOpen === 0 ? (
            <div className="panel corners rounded-md p-6 text-center">
              <div className="display text-xl text-accent-bright">
                Все задачи закрыты
              </div>
              <p className="mt-2 text-base text-secondary">
                Открой /habits или добавь новую задачу
              </p>
            </div>
          ) : (
            <Accordion
              type="multiple"
              defaultValue={["overdue", "today", "week"]}
              className="space-y-3"
            >
              <Bucket
                id="overdue"
                title="Просрочено"
                tone="danger"
                tasks={buckets.overdue}
              />
              <Bucket
                id="today"
                title="Сегодня"
                tone="accent"
                tasks={buckets.today}
              />
              <Bucket
                id="week"
                title="Эта неделя"
                tone="warn"
                tasks={buckets.week}
              />
              <Bucket
                id="month"
                title="Этот месяц"
                tone="muted"
                tasks={buckets.month}
              />
              <Bucket
                id="q3"
                title="3 месяца"
                tone="muted"
                tasks={buckets.q3}
              />
              <Bucket
                id="m6"
                title="6 месяцев"
                tone="muted"
                tasks={buckets.m6}
              />
              <Bucket
                id="year"
                title="Год"
                tone="muted"
                tasks={buckets.year}
              />
              {buckets.later.length > 0 && (
                <Bucket
                  id="later"
                  title="Позже года"
                  tone="muted"
                  tasks={buckets.later}
                />
              )}
            </Accordion>
          )}
        </div>
      )}

      {filter === "priority" && (
        <Accordion
          type="multiple"
          defaultValue={PRIORITY_STEPS.slice(0, 3)}
          className="space-y-3"
        >
          {PRIORITY_STEPS.map((sid) => {
            const step = steps.find((s) => s.id === sid);
            if (!step) return null;
            const list = priorityByStep[sid] ?? [];
            return (
              <PriorityAccordion
                key={sid}
                title={`${sid} — ${step.title}`}
                tasks={list}
              />
            );
          })}
        </Accordion>
      )}

      {filter === "overdue" && (
        <Accordion
          type="multiple"
          defaultValue={["overdue"]}
          className="space-y-3"
        >
          <Bucket
            id="overdue"
            title="Просрочено"
            tone="danger"
            tasks={overdueOnly}
          />
        </Accordion>
      )}

      {filter === "all" && <StepAccordionList steps={steps} tasks={tasks} />}

      {filter === "by_step" && (
        <StepAccordionList steps={steps} tasks={tasks} />
      )}

      <TaskFormDialog open={addOpen} onOpenChange={setAddOpen} />
    </div>
  );
}
