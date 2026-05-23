"use client";

import { useEffect, useState } from "react";
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
import { Icon } from "@/components/Icon";
import { useStore } from "@/lib/store";
import type { Habit, HabitFrequency } from "@/lib/types";
import { cn } from "@/lib/utils";

const ICON_OPTIONS = [
  "PenLine",
  "Languages",
  "Dumbbell",
  "Scale",
  "Send",
  "Footprints",
  "BookOpen",
  "Ban",
];

const COLOR_OPTIONS = [
  "#d4a574",
  "#7cc4d8",
  "#d87c7c",
  "#5fd97a",
  "#9d7cd8",
  "#a0a0a0",
  "#f3c97a",
  "#e36767",
];

export function HabitFormDialog({
  open,
  onOpenChange,
  habit,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  habit?: Habit | null;
}) {
  const addHabit = useStore((s) => s.addHabit);
  const updateHabit = useStore((s) => s.updateHabit);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState("PenLine");
  const [color, setColor] = useState("#d4a574");
  const [frequency, setFrequency] = useState<HabitFrequency>("daily");
  const [target, setTarget] = useState("7");
  const [xp, setXp] = useState("15");
  const [activeUntil, setActiveUntil] = useState("");

  useEffect(() => {
    if (habit) {
      setName(habit.name);
      setDescription(habit.description);
      setIcon(habit.icon);
      setColor(habit.color);
      setFrequency(habit.frequency);
      setTarget(String(habit.target_per_week));
      setXp(String(habit.xp_per_completion));
      setActiveUntil(habit.active_until ?? "");
    } else {
      setName("");
      setDescription("");
      setIcon("PenLine");
      setColor("#d4a574");
      setFrequency("daily");
      setTarget("7");
      setXp("15");
      setActiveUntil("");
    }
  }, [habit, open]);

  const save = () => {
    if (!name.trim()) return;
    const tgt = Math.max(1, Math.min(7, Number(target) || 1));
    const x = Math.max(0, Number(xp) || 0);
    const payload = {
      name: name.trim(),
      description: description.trim(),
      icon,
      color,
      frequency,
      target_per_week: frequency === "daily" ? 7 : tgt,
      xp_per_completion: x,
      active_until: activeUntil || undefined,
    };
    if (habit) {
      updateHabit(habit.id, payload);
    } else {
      addHabit(payload);
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {habit ? "Редактировать привычку" : "Новая привычка"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Название</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="например, Медитация"
              autoFocus
            />
          </div>
          <div className="space-y-1.5">
            <Label>Описание</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Частота</Label>
              <Select
                value={frequency}
                onValueChange={(v) => setFrequency(v as HabitFrequency)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Ежедневно</SelectItem>
                  <SelectItem value="weekly_n">N раз в неделю</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>
                {frequency === "daily" ? "Раз/нед" : "Цель/нед"}
              </Label>
              <Input
                type="number"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                disabled={frequency === "daily"}
              />
            </div>
            <div className="space-y-1.5">
              <Label>XP за выполнение</Label>
              <Input
                type="number"
                value={xp}
                onChange={(e) => setXp(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Активна до (опц.)</Label>
              <Input
                type="date"
                value={activeUntil}
                onChange={(e) => setActiveUntil(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Иконка</Label>
            <div className="flex flex-wrap gap-2">
              {ICON_OPTIONS.map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setIcon(n)}
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded border transition-colors",
                    icon === n
                      ? "border-accent text-accent-bright"
                      : "border-border text-muted hover:border-accent-dim"
                  )}
                >
                  <Icon name={n} className="h-4 w-4" />
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Цвет</Label>
            <div className="flex flex-wrap gap-2">
              {COLOR_OPTIONS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={cn(
                    "h-7 w-7 rounded-full border-2 transition-transform",
                    color === c
                      ? "border-accent-bright scale-110"
                      : "border-transparent"
                  )}
                  style={{ background: c }}
                />
              ))}
            </div>
          </div>
        </div>
        <div className="mt-2 flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Отмена
          </Button>
          <Button onClick={save}>{habit ? "Сохранить" : "Создать"}</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
