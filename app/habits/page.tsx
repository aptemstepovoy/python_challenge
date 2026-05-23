"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import {
  dailyHabits,
  weeklyHabits,
  todayCompletionRatio,
} from "@/lib/habits-logic";
import { HabitDailyCard, HabitWeeklyCard } from "@/components/HabitCard";
import { HabitHeatmap } from "@/components/HabitHeatmap";
import { HabitFormDialog } from "@/components/HabitFormDialog";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Archive, ArchiveRestore, Trash2, Sparkles } from "lucide-react";
import { Icon } from "@/components/Icon";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import type { Habit } from "@/lib/types";
import { cn } from "@/lib/utils";

export default function HabitsPage() {
  const habits = useStore((s) => s.habits);
  const habitLogs = useStore((s) => s.habitLogs);
  const archiveHabit = useStore((s) => s.archiveHabit);
  const unarchiveHabit = useStore((s) => s.unarchiveHabit);
  const deleteHabit = useStore((s) => s.deleteHabit);

  const [editing, setEditing] = useState<Habit | null>(null);
  const [open, setOpen] = useState(false);

  const today = new Date();
  const daily = dailyHabits(habits, today);
  const weekly = weeklyHabits(habits, today);
  const ratio = todayCompletionRatio(habits, habitLogs, today);
  const archived = habits.filter((h) => h.archived);
  const active = habits.filter((h) => !h.archived);
  const allDailyDone = ratio.total > 0 && ratio.done === ratio.total;

  const openNew = () => {
    setEditing(null);
    setOpen(true);
  };
  const openEdit = (h: Habit) => {
    setEditing(h);
    setOpen(true);
  };

  const confirmDelete = (h: Habit) => {
    if (
      typeof window !== "undefined" &&
      window.confirm(`Удалить «${h.name}» вместе со всеми логами?`)
    ) {
      deleteHabit(h.id);
    }
  };

  return (
    <div className="p-4 space-y-7 md:p-10 md:space-y-9">
      <header className="flex flex-col gap-3 border-b border-border pb-5 md:flex-row md:items-baseline md:justify-between md:pb-6">
        <div>
          <h1 className="display text-2xl text-foreground text-glow md:text-3xl">
            Привычки
          </h1>
          <p className="mt-2 text-sm text-muted">
            Ежедневные действия которые двигают к целям
          </p>
        </div>
        <Button onClick={openNew} className="self-start md:self-auto">
          <Plus className="mr-1.5 h-4 w-4" />
          Добавить
        </Button>
      </header>

      <section className="space-y-3">
        <div className="flex items-baseline justify-between">
          <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted">
            ◆ Сегодня · {format(today, "EEEE, d MMM", { locale: ru })}
          </div>
          <span className="num text-xs text-foreground">
            {ratio.done} / {ratio.total}
          </span>
        </div>
        <Progress
          value={ratio.total ? (ratio.done / ratio.total) * 100 : 0}
          tone={allDailyDone ? "ok" : "accent"}
        />

        {allDailyDone && (
          <div className="panel-bright corners flex items-center gap-3 rounded-md p-4">
            <Sparkles className="h-5 w-5 text-accent-bright" />
            <div className="flex-1">
              <div className="display text-sm text-accent-bright">
                Всё на сегодня
              </div>
              <div className="text-xs text-muted">
                Готовься к завтра — открой Tasks
              </div>
            </div>
          </div>
        )}

        <div className="space-y-2">
          {daily.map((h) => (
            <HabitDailyCard key={h.id} habit={h} />
          ))}
        </div>
      </section>

      {weekly.length > 0 && (
        <section className="space-y-3">
          <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted">
            ◆ На неделе
          </div>
          <div className="space-y-2">
            {weekly.map((h) => (
              <HabitWeeklyCard key={h.id} habit={h} />
            ))}
          </div>
        </section>
      )}

      <section>
        <HabitHeatmap />
      </section>

      <section className="space-y-3">
        <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted">
          ◆ Управление
        </div>
        <ul className="space-y-1.5">
          {active.map((h) => (
            <li
              key={h.id}
              className="flex items-center gap-3 rounded border border-border bg-surface px-3 py-2.5"
            >
              <div
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
                style={{
                  color: h.color,
                  border: `2px solid ${h.color}40`,
                }}
              >
                <Icon name={h.icon} className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm text-foreground">{h.name}</div>
                <div className="font-mono text-[10px] uppercase tracking-wider text-muted">
                  {h.frequency === "daily"
                    ? "ежедневно"
                    : `${h.target_per_week}× в неделю`}{" "}
                  · +{h.xp_per_completion} XP
                </div>
              </div>
              <div className="flex shrink-0 gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => openEdit(h)}
                  aria-label="edit"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => archiveHabit(h.id)}
                  aria-label="archive"
                >
                  <Archive className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => confirmDelete(h)}
                  aria-label="delete"
                  className="hover:text-danger-bright"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {archived.length > 0 && (
        <section className="space-y-3">
          <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted">
            ◆ Архив
          </div>
          <ul className="space-y-1.5">
            {archived.map((h) => (
              <li
                key={h.id}
                className={cn(
                  "flex items-center gap-3 rounded border border-border bg-surface px-3 py-2.5",
                  "opacity-70"
                )}
              >
                <div
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full opacity-50"
                  style={{ color: h.color, border: `1px solid ${h.color}30` }}
                >
                  <Icon name={h.icon} className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-muted">{h.name}</div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => unarchiveHabit(h.id)}
                  aria-label="unarchive"
                >
                  <ArchiveRestore className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => confirmDelete(h)}
                  aria-label="delete"
                  className="hover:text-danger-bright"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </li>
            ))}
          </ul>
        </section>
      )}

      <HabitFormDialog open={open} onOpenChange={setOpen} habit={editing} />
    </div>
  );
}
