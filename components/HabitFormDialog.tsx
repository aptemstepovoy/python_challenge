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
  "#a78bfa",
  "#ec4899",
  "#22d3ee",
  "#34d399",
  "#fbbf24",
  "#f472b6",
  "#67e8f9",
  "#fca5a5",
];

const DAYS = [
  { v: 1, l: "Пн" },
  { v: 2, l: "Вт" },
  { v: 3, l: "Ср" },
  { v: 4, l: "Чт" },
  { v: 5, l: "Пт" },
  { v: 6, l: "Сб" },
  { v: 0, l: "Вс" },
];

type FreqMode = "daily" | "weekly_3" | "weekly_1" | "weekly_n" | "custom_days";

function modeFromHabit(habit: Habit | null | undefined): FreqMode {
  if (!habit) return "daily";
  if (habit.frequency === "daily") return "daily";
  if (habit.frequency === "custom_days") return "custom_days";
  if (habit.frequency === "weekly_n") {
    if (habit.target_per_week === 3) return "weekly_3";
    if (habit.target_per_week === 1) return "weekly_1";
    return "weekly_n";
  }
  return "daily";
}

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
  const [color, setColor] = useState("#a78bfa");
  const [mode, setMode] = useState<FreqMode>("daily");
  const [customN, setCustomN] = useState("3");
  const [days, setDays] = useState<number[]>([1, 3, 5]);
  const [xp, setXp] = useState("15");
  const [activeUntil, setActiveUntil] = useState("");

  useEffect(() => {
    if (habit) {
      setName(habit.name);
      setDescription(habit.description);
      setIcon(habit.icon);
      setColor(habit.color);
      setMode(modeFromHabit(habit));
      setCustomN(String(habit.target_per_week ?? 3));
      setDays(habit.days_of_week ?? [1, 3, 5]);
      setXp(String(habit.xp_per_completion));
      setActiveUntil(habit.active_until ?? "");
    } else {
      setName("");
      setDescription("");
      setIcon("PenLine");
      setColor("#a78bfa");
      setMode("daily");
      setCustomN("3");
      setDays([1, 3, 5]);
      setXp("15");
      setActiveUntil("");
    }
  }, [habit, open]);

  const toggleDay = (d: number) => {
    setDays((prev) =>
      prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d].sort()
    );
  };

  const save = () => {
    if (!name.trim()) return;
    const x = Math.max(0, Number(xp) || 0);

    let frequency: HabitFrequency = "daily";
    let target_per_week = 7;
    let days_of_week: number[] | undefined = undefined;

    if (mode === "daily") {
      frequency = "daily";
      target_per_week = 7;
    } else if (mode === "weekly_3") {
      frequency = "weekly_n";
      target_per_week = 3;
    } else if (mode === "weekly_1") {
      frequency = "weekly_n";
      target_per_week = 1;
    } else if (mode === "weekly_n") {
      frequency = "weekly_n";
      target_per_week = Math.max(1, Math.min(7, Number(customN) || 1));
    } else if (mode === "custom_days") {
      frequency = "custom_days";
      days_of_week = days.length > 0 ? days : [1];
      target_per_week = days_of_week.length;
    }

    const payload = {
      name: name.trim(),
      description: description.trim(),
      icon,
      color,
      frequency,
      target_per_week,
      days_of_week,
      xp_per_completion: x,
      active_until: activeUntil || undefined,
    };

    if (habit) updateHabit(habit.id, payload);
    else addHabit(payload);
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
        <div className="max-h-[70vh] overflow-y-auto space-y-4 pr-1">
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

          <div className="space-y-1.5">
            <Label>Частота</Label>
            <Select value={mode} onValueChange={(v) => setMode(v as FreqMode)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Каждый день</SelectItem>
                <SelectItem value="weekly_3">3 раза в неделю</SelectItem>
                <SelectItem value="weekly_1">1 раз в неделю</SelectItem>
                <SelectItem value="weekly_n">N раз в неделю</SelectItem>
                <SelectItem value="custom_days">Свой график (дни)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {mode === "weekly_n" && (
            <div className="space-y-1.5">
              <Label>Сколько раз в неделю</Label>
              <Input
                type="number"
                value={customN}
                min={1}
                max={7}
                onChange={(e) => setCustomN(e.target.value)}
              />
            </div>
          )}

          {mode === "custom_days" && (
            <div className="space-y-1.5">
              <Label>В какие дни</Label>
              <div className="flex flex-wrap gap-1.5">
                {DAYS.map((d) => (
                  <button
                    key={d.v}
                    type="button"
                    onClick={() => toggleDay(d.v)}
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-md border text-sm transition-colors",
                      days.includes(d.v)
                        ? "border-transparent bg-gradient-to-br from-violet to-pink text-white"
                        : "border-border-bright bg-surface-2/50 text-foreground hover:border-accent"
                    )}
                  >
                    {d.l}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
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
                      : "border-border text-secondary hover:border-accent-dim"
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
