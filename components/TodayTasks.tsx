"use client";

import { useMemo } from "react";
import { useStore } from "@/lib/store";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { haptic } from "@/lib/haptics";
import {
  cn,
  deadlineCategory,
  formatDateRu,
  isOverdue,
} from "@/lib/utils";
import type { Task } from "@/lib/types";

function classifyTasks(tasks: Task[], today: Date) {
  const todayISO = today.toISOString().slice(0, 10);
  const overdue = tasks.filter(
    (t) => t.status !== "done" && t.deadline < todayISO
  );
  const due = tasks.filter(
    (t) => t.status !== "done" && t.deadline === todayISO
  );
  const inProgress = tasks.filter(
    (t) =>
      t.status === "in_progress" &&
      t.deadline > todayISO &&
      !overdue.includes(t) &&
      !due.includes(t)
  );
  return { overdue, due, inProgress };
}

function Row({ task }: { task: Task }) {
  const completeTask = useStore((s) => s.completeTask);
  const cycle = useStore((s) => s.cycleTaskStatus);
  const cat = deadlineCategory(task.deadline);
  const done = task.status === "done";

  return (
    <div
      className={cn(
        "group flex items-center gap-3 rounded border px-3 py-2.5 transition-colors",
        task.status === "in_progress"
          ? "border-accent/40 bg-accent/5"
          : "border-border bg-surface hover:border-accent-dim",
        task.status === "blocked" && "border-danger/40"
      )}
    >
      <Checkbox
        checked={done}
        onCheckedChange={() => {
          haptic("success");
          if (done) cycle(task.id);
          else completeTask(task.id);
        }}
      />
      <div className="flex-1 min-w-0">
        <div className="num text-[10px] text-muted">{task.id}</div>
        <div
          className={cn(
            "truncate text-sm",
            done ? "text-muted line-through" : "text-foreground"
          )}
        >
          {task.title}
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <span className="num text-[10px] text-muted">+{task.xp ?? 25}</span>
        {!done && cat === "overdue" && (
          <Badge tone="danger">Просрочено</Badge>
        )}
        {!done && cat === "week" && <Badge tone="warn">Неделя</Badge>}
      </div>
    </div>
  );
}

export function TodayTasks() {
  const tasks = useStore((s) => s.tasks);
  const today = new Date();
  const { overdue, due, inProgress } = useMemo(
    () => classifyTasks(tasks, today),
    [tasks, today]
  );

  const totalCount = overdue.length + due.length + inProgress.length;

  if (totalCount === 0) {
    return (
      <div className="panel corners rounded-md p-5 text-center">
        <div className="display text-sm text-accent-bright">Сегодня чисто</div>
        <p className="mt-1 text-xs text-muted">
          Открой Tasks и распланируй неделю
        </p>
      </div>
    );
  }

  return (
    <section className="space-y-4">
      <div className="flex items-baseline justify-between">
        <div className="display text-sm text-foreground">Задачи на сегодня</div>
        <span className="num text-[11px] text-muted">{totalCount}</span>
      </div>

      {overdue.length > 0 && (
        <div className="space-y-2">
          <div className="font-mono text-[10px] uppercase tracking-[0.15em] text-danger-bright">
            ◆ Просрочено · {overdue.length}
          </div>
          <div className="space-y-1.5">
            {overdue.map((t) => (
              <Row key={t.id} task={t} />
            ))}
          </div>
        </div>
      )}

      {due.length > 0 && (
        <div className="space-y-2">
          <div className="font-mono text-[10px] uppercase tracking-[0.15em] text-accent-bright">
            ◆ Дедлайн сегодня · {due.length}
          </div>
          <div className="space-y-1.5">
            {due.map((t) => (
              <Row key={t.id} task={t} />
            ))}
          </div>
        </div>
      )}

      {inProgress.length > 0 && (
        <div className="space-y-2">
          <div className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted">
            ◆ В работе · {inProgress.length}
          </div>
          <div className="space-y-1.5">
            {inProgress.map((t) => (
              <Row key={t.id} task={t} />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
