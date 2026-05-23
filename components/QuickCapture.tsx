"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Scale, Check, BookOpen, Zap } from "lucide-react";
import { useStore } from "@/lib/store";
import { haptic } from "@/lib/haptics";

type Mode = "menu" | "weight" | "task";

function WeightForm({ onDone }: { onDone: () => void }) {
  const addWeightEntry = useStore((s) => s.addWeightEntry);
  const last = useStore(
    (s) => s.weightEntries[s.weightEntries.length - 1] ?? null
  );
  const [value, setValue] = useState("");

  const save = () => {
    const n = Number(value);
    if (Number.isNaN(n) || n <= 0) return;
    haptic("success");
    addWeightEntry({
      date: new Date().toISOString().slice(0, 10),
      weight_kg: n,
    });
    onDone();
  };

  return (
    <div className="space-y-3">
      <div className="font-mono text-xs uppercase tracking-wider text-muted">
        Вес сегодня, кг
      </div>
      <Input
        type="number"
        step="0.1"
        inputMode="decimal"
        autoFocus
        placeholder={last ? String(last.weight_kg) : "110"}
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
      {last && (
        <div className="font-mono text-[10px] uppercase tracking-wider text-muted">
          Прошлый: <span className="num text-foreground/70">{last.weight_kg}</span> кг
        </div>
      )}
      <Button onClick={save} className="w-full">
        Сохранить
      </Button>
    </div>
  );
}

function TaskQuickList({ onDone }: { onDone: () => void }) {
  const tasks = useStore((s) => s.tasks);
  const cycle = useStore((s) => s.cycleTaskStatus);
  const setStatus = useStore((s) => s.setTaskStatus);

  const open = tasks
    .filter((t) => t.status !== "done")
    .slice()
    .sort((a, b) => {
      const aP = a.status === "in_progress" ? 0 : 1;
      const bP = b.status === "in_progress" ? 0 : 1;
      if (aP !== bP) return aP - bP;
      return a.deadline.localeCompare(b.deadline);
    })
    .slice(0, 10);

  const mark = (id: string) => {
    haptic("success");
    setStatus(id, "done");
    onDone();
  };

  if (open.length === 0) {
    return (
      <div className="py-6 text-center text-sm text-muted">
        Открытых задач нет
      </div>
    );
  }

  return (
    <div className="space-y-1.5 max-h-[50vh] overflow-y-auto">
      <div className="mb-2 font-mono text-xs uppercase tracking-wider text-muted">
        Отметить сделанной
      </div>
      {open.map((t) => (
        <button
          key={t.id}
          onClick={() => mark(t.id)}
          className="flex w-full items-center gap-3 rounded border border-border bg-surface-2 px-3 py-2.5 text-left hover:border-accent transition-colors"
        >
          <Check className="h-4 w-4 shrink-0 text-muted" />
          <span className="num shrink-0 text-xs text-muted">{t.id}</span>
          <span className="flex-1 truncate text-sm text-foreground">
            {t.title}
          </span>
        </button>
      ))}
    </div>
  );
}

function Menu({
  setMode,
  closeAndGo,
}: {
  setMode: (m: Mode) => void;
  closeAndGo: (path: string) => void;
}) {
  const items = [
    {
      icon: Scale,
      label: "Залогать вес",
      sub: "Запишет в график и обновит KGI",
      action: () => setMode("weight"),
    },
    {
      icon: Check,
      label: "Отметить задачу",
      sub: "Выбери из списка открытых",
      action: () => setMode("task"),
    },
    {
      icon: BookOpen,
      label: "Начать ревью",
      sub: "Откроет форму weekly review",
      action: () => closeAndGo("/review"),
    },
  ];

  return (
    <div className="space-y-2">
      {items.map((it) => (
        <button
          key={it.label}
          onClick={it.action}
          className="flex w-full items-center gap-4 rounded border border-border bg-surface-2 p-4 text-left hover:border-accent transition-colors"
        >
          <it.icon className="h-5 w-5 shrink-0 text-accent" />
          <div className="flex-1 min-w-0">
            <div className="text-sm text-foreground">{it.label}</div>
            <div className="mt-0.5 text-[11px] text-muted">{it.sub}</div>
          </div>
        </button>
      ))}
    </div>
  );
}

export function QuickCapture() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<Mode>("menu");

  const handleOpenChange = (o: boolean) => {
    setOpen(o);
    if (!o) setMode("menu");
    if (o) haptic("tap");
  };

  const closeAndGo = (path: string) => {
    setOpen(false);
    setMode("menu");
    router.push(path);
  };

  return (
    <>
      <button
        aria-label="Quick capture"
        onClick={() => handleOpenChange(true)}
        className="fixed bottom-20 right-4 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-accent text-background shadow-lg shadow-black/40 active:scale-95 transition-transform md:bottom-8"
      >
        <Plus className="h-6 w-6" strokeWidth={2.5} />
      </button>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-accent" />
              {mode === "menu"
                ? "Быстрое действие"
                : mode === "weight"
                  ? "Лог веса"
                  : "Отметить задачу"}
            </DialogTitle>
          </DialogHeader>
          {mode === "menu" && (
            <Menu setMode={setMode} closeAndGo={closeAndGo} />
          )}
          {mode === "weight" && (
            <WeightForm onDone={() => handleOpenChange(false)} />
          )}
          {mode === "task" && (
            <TaskQuickList onDone={() => handleOpenChange(false)} />
          )}
          {mode !== "menu" && (
            <button
              onClick={() => setMode("menu")}
              className="text-xs font-mono uppercase tracking-wider text-muted hover:text-foreground"
            >
              ← назад
            </button>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
