"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import type { KGI } from "@/lib/types";
import {
  PLAN_START,
  TARGET_MAY,
  TARGET_NOV,
  expectedProgress,
  progressToTarget,
} from "@/lib/utils";
import { useStore } from "@/lib/store";

function pickTarget(kgi: KGI, today: Date) {
  const novDate = new Date(TARGET_NOV);
  if (today <= novDate) {
    return { value: kgi.target_nov_2026, date: TARGET_NOV, label: "23 ноя 2026" };
  }
  return { value: kgi.target_may_2027, date: TARGET_MAY, label: "23 мая 2027" };
}

function progressTone(actual: number, expected: number): "ok" | "warn" | "danger" {
  if (expected <= 0) return "ok";
  const ratio = actual / expected;
  if (ratio >= 1) return "ok";
  if (ratio >= 0.7) return "warn";
  return "danger";
}

export function KGICard({ kgi }: { kgi: KGI }) {
  const setKGI = useStore((s) => s.setKGI);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(String(kgi.current_value));
  const today = new Date();
  const target = pickTarget(kgi, today);

  const isNumeric =
    typeof kgi.start_value === "number" && typeof target.value === "number";

  const actualPct = isNumeric
    ? progressToTarget(
        kgi.start_value as number,
        Number(kgi.current_value),
        target.value as number,
        kgi.higher_is_better ?? true
      )
    : kgi.current_value === target.value
      ? 100
      : 0;

  const expectedPct = expectedProgress(PLAN_START, target.date, today);
  const tone = progressTone(actualPct, expectedPct);

  const save = () => {
    const parsed = isNumeric ? Number(draft) : draft;
    if (isNumeric && Number.isNaN(parsed as number)) return;
    setKGI(kgi.id, parsed as number | string);
    setOpen(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (o) setDraft(String(kgi.current_value));
      }}
    >
      <DialogTrigger asChild>
        <Card className="cursor-pointer p-6 hover:border-accent-dim transition-colors">
          <div className="mb-4 flex items-baseline justify-between">
            <div className="font-mono text-xs uppercase tracking-wider text-muted">
              {kgi.name}
            </div>
            {kgi.unit && (
              <div className="font-mono text-[10px] uppercase tracking-wider text-muted">
                {kgi.unit}
              </div>
            )}
          </div>

          <div className="mb-4 num text-3xl text-foreground">
            {kgi.current_value}
          </div>

          <Progress value={actualPct} tone={tone} className="mb-3" />

          <div className="flex justify-between font-mono text-[10px] uppercase tracking-wider text-muted">
            <span>
              Старт: <span className="text-foreground/70">{kgi.start_value}</span>
            </span>
            <span>
              Цель {target.label.split(" ")[2]}:{" "}
              <span className="text-foreground/70">{target.value}</span>
            </span>
          </div>
        </Card>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>{kgi.name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label>Текущее значение</Label>
            <Input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              type={isNumeric ? "number" : "text"}
              step="any"
            />
          </div>
          <div className="font-mono text-[10px] uppercase tracking-wider text-muted">
            Старт: {kgi.start_value} → Ноя 2026: {kgi.target_nov_2026} → Май 2027:{" "}
            {kgi.target_may_2027}
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Отмена
          </Button>
          <Button onClick={save}>Сохранить</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
