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
import { TaskItem } from "@/components/TaskItem";
import { TaskFormDialog } from "@/components/TaskFormDialog";
import type { Step, Task } from "@/lib/types";
import { Plus } from "lucide-react";

function AddTaskButton({ step }: { step: Step }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setOpen(true)}
        className="text-secondary hover:text-accent-bright"
      >
        <Plus className="mr-1 h-3.5 w-3.5" /> Добавить задачу
      </Button>
      <TaskFormDialog
        open={open}
        onOpenChange={setOpen}
        defaultStepId={step.id}
      />
    </>
  );
}

export function StepAccordion({
  step,
  tasks,
}: {
  step: Step;
  tasks: Task[];
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
        <div className="flex w-full items-center gap-3 pr-3 md:gap-4 md:pr-4">
          <span className="num w-12 shrink-0 text-sm text-secondary">{step.id}</span>
          <span className="flex-1 truncate text-base text-foreground text-left">{step.title}</span>
          <span className="num shrink-0 text-sm text-secondary">
            {done} / {total}
          </span>
          <div className="hidden w-24 shrink-0 md:block">
            <Progress value={pct} tone="accent" />
          </div>
        </div>
      </AccordionTrigger>
      <AccordionContent>
        <div className="space-y-1">
          {tasks.length === 0 ? (
            <div className="px-3 py-4 text-base text-secondary">Задач пока нет</div>
          ) : (
            tasks.map((t) => <TaskItem key={t.id} task={t} />)
          )}
          <div className="pt-2">
            <AddTaskButton step={step} />
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
