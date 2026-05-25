"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input, Textarea } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useStore } from "@/lib/store";
import { haptic } from "@/lib/haptics";
import { suggestEstimateDays } from "@/lib/today-logic";
import type { EnergyLevel, Task } from "@/lib/types";

const todayISO = () => new Date().toISOString().slice(0, 10);
const inDaysISO = (d: number) => {
  const dt = new Date();
  dt.setDate(dt.getDate() + d);
  return dt.toISOString().slice(0, 10);
};

export function TaskFormDialog({
  open,
  onOpenChange,
  task,
  defaultStepId,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  task?: Task | null;
  defaultStepId?: string;
}) {
  const steps = useStore((s) => s.steps);
  const tasks = useStore((s) => s.tasks);
  const addTask = useStore((s) => s.addTask);
  const updateTask = useStore((s) => s.updateTask);

  const [title, setTitle] = useState("");
  const [stepId, setStepId] = useState(defaultStepId ?? steps[0]?.id ?? "S1");
  const [startDate, setStartDate] = useState(todayISO());
  const [deadline, setDeadline] = useState(inDaysISO(7));
  const [result, setResult] = useState("");
  const [xp, setXp] = useState("25");
  const [linkedBoss, setLinkedBoss] = useState<string>("none");
  const [estimatedDays, setEstimatedDays] = useState("1");
  const [energy, setEnergy] = useState<EnergyLevel | "none">("none");
  const [err, setErr] = useState<string | null>(null);

  const suggestion = useMemo(
    () => (stepId ? suggestEstimateDays(stepId, tasks) : 1),
    [stepId, tasks]
  );

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setStepId(task.step_id);
      setStartDate(task.start_date);
      setDeadline(task.deadline);
      setResult(task.result_definition ?? "");
      setXp(String(task.xp ?? 25));
      setLinkedBoss(task.linked_boss ?? "none");
      setEstimatedDays(String(task.estimated_days ?? 1));
      setEnergy(task.energy ?? "none");
    } else {
      setTitle("");
      setStepId(defaultStepId ?? steps[0]?.id ?? "S1");
      setStartDate(todayISO());
      setDeadline(inDaysISO(7));
      setResult("");
      setXp("25");
      setLinkedBoss("none");
      setEstimatedDays("1");
      setEnergy("none");
    }
    setErr(null);
  }, [task, open, defaultStepId, steps]);

  const submit = () => {
    if (!title.trim()) {
      setErr("Название обязательно");
      return;
    }
    if (!deadline) {
      setErr("Дедлайн обязателен — задача без дедлайна не может существовать");
      return;
    }
    if (deadline < startDate) {
      setErr("Дедлайн не может быть раньше старта");
      return;
    }
    const xpNum = Math.max(0, Number(xp) || 25);
    const daysNum = Math.max(1, Math.min(365, Number(estimatedDays) || 1));
    const boss = linkedBoss === "none" ? undefined : linkedBoss;
    const en = energy === "none" ? undefined : energy;
    haptic("success");
    if (task) {
      updateTask(task.id, {
        title: title.trim(),
        step_id: stepId,
        start_date: startDate,
        deadline,
        result_definition: result,
        xp: xpNum,
        linked_boss: boss,
        estimated_days: daysNum,
        energy: en,
        // Graduating an Inbox task → promote it to todo on save.
        ...(task.status === "inbox" ? { status: "todo" as const } : {}),
      });
    } else {
      addTask({
        title: title.trim(),
        step_id: stepId,
        start_date: startDate,
        deadline,
        status: "todo",
        result_definition: result,
        xp: xpNum,
        linked_boss: boss,
        estimated_days: daysNum,
        energy: en,
      });
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {task ? "Редактировать задачу" : "Новая задача"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Название *</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="что нужно сделать"
              autoFocus
            />
          </div>

          <div className="space-y-1.5">
            <Label>Шаг плана *</Label>
            <Select value={stepId} onValueChange={setStepId}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {steps.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.id} — {s.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Старт</Label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Дедлайн *</Label>
              <Input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Дней на задачу *</Label>
              <Input
                type="number"
                min={1}
                max={365}
                value={estimatedDays}
                onChange={(e) => setEstimatedDays(e.target.value)}
              />
              {suggestion > 1 && Number(estimatedDays) !== suggestion && (
                <button
                  type="button"
                  onClick={() => setEstimatedDays(String(suggestion))}
                  className="text-[10px] text-accent-bright hover:text-pink-bright text-left"
                >
                  ~ Похожие занимали {suggestion} дн., взять?
                </button>
              )}
            </div>
            <div className="space-y-1.5">
              <Label>Энергия</Label>
              <Select
                value={energy}
                onValueChange={(v) => setEnergy(v as EnergyLevel | "none")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="—" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Не указано</SelectItem>
                  <SelectItem value="low">Low (рутина)</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High (глубокая)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <p className="text-[11px] text-secondary leading-snug">
            Появится в «Сегодня» за {estimatedDays || 1} дн. до дедлайна,
            если её не положить на стол раньше.
          </p>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>XP за задачу</Label>
              <Input
                type="number"
                value={xp}
                onChange={(e) => setXp(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Связан с боссом</Label>
              <Select value={linkedBoss} onValueChange={setLinkedBoss}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Без босса</SelectItem>
                  <SelectItem value="naym">Найм</SelectItem>
                  <SelectItem value="telo">Тело</SelectItem>
                  <SelectItem value="bali">Бали</SelectItem>
                  <SelectItem value="product">Продукт</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Определение результата</Label>
            <Textarea
              value={result}
              onChange={(e) => setResult(e.target.value)}
              rows={3}
              placeholder="как поймёшь что задача закрыта"
            />
          </div>

          {err && (
            <div className="rounded border border-danger/50 bg-danger/10 px-3 py-2 text-sm text-danger-bright">
              {err}
            </div>
          )}
        </div>
        <div className="mt-2 flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Отмена
          </Button>
          <Button onClick={submit}>{task ? "Сохранить" : "Создать"}</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
