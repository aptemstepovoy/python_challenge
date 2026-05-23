"use client";

import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn, deadlineCategory, formatDateRu } from "@/lib/utils";
import { useStore } from "@/lib/store";
import type { Status, Task } from "@/lib/types";

const STATUS_LABEL: Record<Status, string> = {
  todo: "В ожидании",
  in_progress: "В работе",
  done: "Сделано",
  blocked: "Блок",
};

const STATUS_TONE: Record<Status, "neutral" | "accent" | "ok" | "danger"> = {
  todo: "neutral",
  in_progress: "accent",
  done: "ok",
  blocked: "danger",
};

const toneByCat = {
  overdue: "danger",
  week: "warn",
  month: "accent",
  later: "neutral",
} as const;

export function TaskItem({ task }: { task: Task }) {
  const cycle = useStore((s) => s.cycleTaskStatus);
  const setStatus = useStore((s) => s.setTaskStatus);
  const [open, setOpen] = useState(false);

  const cat = deadlineCategory(task.deadline);
  const done = task.status === "done";

  return (
    <>
      <div
        className={cn(
          "group flex items-center gap-3 rounded border border-transparent px-3 py-2.5 hover:border-border hover:bg-surface-2 transition-colors",
          task.status === "blocked" && "border-danger/30"
        )}
      >
        <Checkbox
          checked={done}
          onCheckedChange={() => cycle(task.id)}
          aria-label="toggle status"
        />
        <button
          onClick={() => setOpen(true)}
          className="flex flex-1 items-baseline gap-3 text-left min-w-0"
        >
          <span className="num shrink-0 text-xs text-muted">{task.id}</span>
          <span
            className={cn(
              "flex-1 truncate text-sm",
              done ? "text-muted line-through" : "text-foreground"
            )}
          >
            {task.title}
          </span>
        </button>
        <div className="flex shrink-0 items-center gap-3">
          <span className="num text-xs text-muted">
            {formatDateRu(task.deadline)}
          </span>
          {!done && <Badge tone={toneByCat[cat]}>{cat === "overdue" ? "Просрочено" : cat === "week" ? "Неделя" : cat === "month" ? "Месяц" : "Позже"}</Badge>}
          <Badge tone={STATUS_TONE[task.status]}>{STATUS_LABEL[task.status]}</Badge>
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              <span className="num mr-3 text-muted">{task.id}</span>
              {task.title}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <div className="font-mono uppercase tracking-wider text-muted mb-1">
                  Старт
                </div>
                <div className="num text-foreground">
                  {formatDateRu(task.start_date)}
                </div>
              </div>
              <div>
                <div className="font-mono uppercase tracking-wider text-muted mb-1">
                  Дедлайн
                </div>
                <div className="num text-foreground">
                  {formatDateRu(task.deadline)}
                </div>
              </div>
            </div>

            <div>
              <div className="font-mono text-xs uppercase tracking-wider text-muted mb-1">
                Определение результата
              </div>
              <div className="text-sm text-foreground">
                {task.result_definition || "—"}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Статус</Label>
              <Select
                value={task.status}
                onValueChange={(v) => setStatus(task.id, v as Status)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todo">{STATUS_LABEL.todo}</SelectItem>
                  <SelectItem value="in_progress">
                    {STATUS_LABEL.in_progress}
                  </SelectItem>
                  <SelectItem value="done">{STATUS_LABEL.done}</SelectItem>
                  <SelectItem value="blocked">{STATUS_LABEL.blocked}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end">
            <Button onClick={() => setOpen(false)}>Закрыть</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
