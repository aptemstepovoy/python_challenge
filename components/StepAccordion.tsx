"use client";

import { useMemo, useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input, Textarea } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TaskItem } from "@/components/TaskItem";
import { useStore } from "@/lib/store";
import type { Step, Task } from "@/lib/types";
import { Plus } from "lucide-react";

function AddTaskDialog({ step }: { step: Step }) {
  const addTask = useStore((s) => s.addTask);
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [deadline, setDeadline] = useState(step.deadline);
  const [result, setResult] = useState("");

  const submit = () => {
    if (!title.trim()) return;
    addTask({
      step_id: step.id,
      title: title.trim(),
      start_date: new Date().toISOString().slice(0, 10),
      deadline,
      status: "todo",
      result_definition: result,
    });
    setTitle("");
    setResult("");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setOpen(true)}
        className="text-muted hover:text-accent"
      >
        <Plus className="mr-1 h-3.5 w-3.5" /> Добавить задачу
      </Button>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Новая задача — {step.id}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label>Название</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Дедлайн</Label>
            <Input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Определение результата</Label>
            <Textarea
              value={result}
              onChange={(e) => setResult(e.target.value)}
            />
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Отмена
          </Button>
          <Button onClick={submit}>Создать</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function StepAccordion({
  step,
  tasks,
  defaultOpen,
}: {
  step: Step;
  tasks: Task[];
  defaultOpen?: boolean;
}) {
  const total = tasks.length;
  const done = useMemo(
    () => tasks.filter((t) => t.status === "done").length,
    [tasks]
  );
  const pct = total === 0 ? 0 : (done / total) * 100;

  return (
    <AccordionItem value={step.id}>
      <AccordionTrigger>
        <div className="flex w-full items-center gap-4 pr-4">
          <span className="num w-12 shrink-0 text-xs text-muted">{step.id}</span>
          <span className="flex-1 text-sm text-foreground">{step.title}</span>
          <span className="num shrink-0 text-xs text-muted">
            {done} / {total}
          </span>
          <div className="w-24 shrink-0">
            <Progress value={pct} tone="accent" />
          </div>
        </div>
      </AccordionTrigger>
      <AccordionContent>
        <div className="space-y-1">
          {tasks.length === 0 ? (
            <div className="px-3 py-4 text-sm text-muted">Задач пока нет</div>
          ) : (
            tasks.map((t) => <TaskItem key={t.id} task={t} />)
          )}
          <div className="pt-2">
            <AddTaskDialog step={step} />
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}

export function StepAccordionList({
  steps,
  tasks,
}: {
  steps: Step[];
  tasks: Task[];
}) {
  const tasksByStep = useMemo(() => {
    const map: Record<string, Task[]> = {};
    for (const t of tasks) {
      (map[t.step_id] ??= []).push(t);
    }
    return map;
  }, [tasks]);

  return (
    <Accordion type="multiple" className="space-y-3">
      {steps.map((s) => (
        <StepAccordion
          key={s.id}
          step={s}
          tasks={tasksByStep[s.id] ?? []}
        />
      ))}
    </Accordion>
  );
}
