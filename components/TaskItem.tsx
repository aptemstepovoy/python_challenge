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
import { TaskFormDialog } from "@/components/TaskFormDialog";
import { cn, deadlineCategory, formatDateRu } from "@/lib/utils";
import { useStore } from "@/lib/store";
import { haptic } from "@/lib/haptics";
import { Pencil, Trash2 } from "lucide-react";
import type { Status, Task } from "@/lib/types";

const STATUS_LABEL: Record<Status, string> = {
  inbox: "Inbox",
  todo: "В ожидании",
  in_progress: "В работе",
  done: "Сделано",
  blocked: "Блок",
};

const STATUS_TONE: Record<Status, "neutral" | "accent" | "ok" | "danger"> = {
  inbox: "neutral",
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
  const deleteTask = useStore((s) => s.deleteTask);
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  const cat = deadlineCategory(task.deadline);
  const done = task.status === "done";

  const onDelete = () => {
    if (
      typeof window !== "undefined" &&
      window.confirm(`Удалить задачу «${task.title}»?`)
    ) {
      deleteTask(task.id);
      setOpen(false);
    }
  };

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
          onCheckedChange={() => {
            const next = task.status === "in_progress" ? "success" : "tap";
            haptic(next);
            cycle(task.id);
          }}
          aria-label="toggle status"
        />
        <button
          onClick={() => setOpen(true)}
          className="flex flex-1 items-baseline gap-3 text-left min-w-0"
        >
          <span className="num shrink-0 text-xs text-secondary">{task.id}</span>
          <span
            className={cn(
              "flex-1 truncate text-sm",
              done ? "text-secondary line-through" : "text-foreground"
            )}
          >
            {task.title}
          </span>
        </button>
        <div className="flex shrink-0 items-center gap-2 md:gap-3">
          <span className="num text-[11px] text-secondary md:text-xs">
            {formatDateRu(task.deadline)}
          </span>
          {!done && (
            <Badge tone={toneByCat[cat]} className="hidden sm:inline-flex">
              {cat === "overdue" ? "Просрочено" : cat === "week" ? "Неделя" : cat === "month" ? "Месяц" : "Позже"}
            </Badge>
          )}
          <Badge tone={STATUS_TONE[task.status]}>{STATUS_LABEL[task.status]}</Badge>
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              <span className="num mr-3 text-secondary">{task.id}</span>
              {task.title}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="font-mono text-xs uppercase tracking-wider text-secondary mb-1">
                  Старт
                </div>
                <div className="num text-foreground">
                  {formatDateRu(task.start_date)}
                </div>
              </div>
              <div>
                <div className="font-mono text-xs uppercase tracking-wider text-secondary mb-1">
                  Дедлайн
                </div>
                <div className="num text-foreground">
                  {formatDateRu(task.deadline)}
                </div>
              </div>
            </div>

            <div>
              <div className="font-mono text-xs uppercase tracking-wider text-secondary mb-1">
                Определение результата
              </div>
              <div className="text-base text-foreground">
                {task.result_definition || "—"}
              </div>
            </div>

            {task.linked_boss && (
              <div>
                <div className="font-mono text-xs uppercase tracking-wider text-secondary mb-1">
                  Босс
                </div>
                <div className="text-base text-accent-bright">
                  {task.linked_boss}
                </div>
              </div>
            )}

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
          <div className="flex flex-wrap justify-between gap-2">
            <Button
              variant="ghost"
              onClick={onDelete}
              className="text-danger-bright hover:bg-danger/10"
            >
              <Trash2 className="mr-1.5 h-4 w-4" />
              Удалить
            </Button>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setOpen(false);
                  setEditOpen(true);
                }}
              >
                <Pencil className="mr-1.5 h-4 w-4" />
                Редактировать
              </Button>
              <Button onClick={() => setOpen(false)}>Закрыть</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <TaskFormDialog open={editOpen} onOpenChange={setEditOpen} task={task} />
    </>
  );
}
