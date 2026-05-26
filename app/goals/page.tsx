"use client";

import { useMemo, useState } from "react";
import { differenceInCalendarDays, parseISO } from "date-fns";
import { Pencil } from "lucide-react";
import { useStore } from "@/lib/store";
import { kgiProgress, STATUS_LABEL, STATUS_COLOR } from "@/lib/mission-logic";
import { PLAN_START, TARGET_NOV, TARGET_MAY, cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const KGI_LABEL: Record<string, string> = {
  income: "Доход, $/мес",
  weight: "Вес, кг",
  subscribers: "TG подписчики",
  english: "Английский",
  clients: "Платящих клиентов",
  location: "Локация",
};

function fmt(v: number | string): string {
  if (typeof v === "string") return v;
  return v.toLocaleString("ru-RU");
}

export default function GoalsPage() {
  const kgis = useStore((s) => s.kgis);
  const steps = useStore((s) => s.steps);
  const setKGI = useStore((s) => s.setKGI);
  const vision = useStore((s) => s.vision);
  const setVision = useStore((s) => s.setVision);

  const today = useMemo(() => new Date(), []);
  const daysToNov = Math.max(
    0,
    differenceInCalendarDays(parseISO(TARGET_NOV), today)
  );
  const daysToMay = Math.max(
    0,
    differenceInCalendarDays(parseISO(TARGET_MAY), today)
  );

  const [editingVision, setEditingVision] = useState(false);
  const [draft, setDraft] = useState(vision);
  const [editingKgi, setEditingKgi] = useState<string | null>(null);
  const [kgiDraft, setKgiDraft] = useState("");

  const startEditKgi = (id: string, current: number | string) => {
    setEditingKgi(id);
    setKgiDraft(String(current));
  };
  const saveKgi = () => {
    if (!editingKgi) return;
    const kgi = kgis.find((k) => k.id === editingKgi);
    if (!kgi) return;
    const next = typeof kgi.start_value === "number" ? Number(kgiDraft) : kgiDraft;
    if (typeof next === "number" && !Number.isFinite(next)) return;
    setKGI(editingKgi, next);
    setEditingKgi(null);
  };

  return (
    <div className="p-4 space-y-6 md:p-8 md:space-y-8 max-w-3xl mx-auto">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold text-foreground md:text-3xl">
          Цели
        </h1>
        <p className="text-sm text-secondary">
          К ноябрю — <span className="num text-foreground">{daysToNov}</span> дн.
          {" · "}
          К маю 27 — <span className="num text-foreground">{daysToMay}</span> дн.
        </p>
      </header>

      {/* Vision */}
      <section className="rounded-lg border border-border bg-surface p-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-[11px] uppercase tracking-wider text-secondary">
            Зачем
          </h2>
          {!editingVision && (
            <button
              onClick={() => {
                setDraft(vision);
                setEditingVision(true);
              }}
              className="text-muted hover:text-accent-bright"
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        {editingVision ? (
          <div className="space-y-2">
            <Textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              rows={3}
              maxLength={240}
              autoFocus
            />
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() => {
                  setVision(draft);
                  setEditingVision(false);
                }}
              >
                Сохранить
              </Button>
              <button
                onClick={() => setEditingVision(false)}
                className="text-xs text-secondary hover:text-foreground px-2"
              >
                Отмена
              </button>
            </div>
          </div>
        ) : (
          <p className="text-foreground text-[15px] leading-snug">{vision}</p>
        )}
      </section>

      {/* KGI */}
      <section className="space-y-2">
        <h2 className="text-[11px] uppercase tracking-wider text-secondary">
          Метрики · ноябрь 2026
        </h2>
        <div className="space-y-2">
          {kgis.map((k) => {
            const p = kgiProgress(k, today);
            const label = KGI_LABEL[k.id] ?? k.name;
            const editing = editingKgi === k.id;
            return (
              <div
                key={k.id}
                className="rounded-md border border-border bg-surface p-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="text-[14px] text-foreground">{label}</div>
                  {p && (
                    <span
                      className={cn(
                        "text-[11px] num",
                        STATUS_COLOR[p.status]
                      )}
                    >
                      {STATUS_LABEL[p.status]}
                    </span>
                  )}
                </div>
                <div className="mt-1 flex items-baseline gap-2 num">
                  {editing ? (
                    <input
                      type={
                        typeof k.start_value === "number" ? "number" : "text"
                      }
                      value={kgiDraft}
                      onChange={(e) => setKgiDraft(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && saveKgi()}
                      onBlur={saveKgi}
                      autoFocus
                      className="w-24 rounded border border-accent bg-surface-2 px-2 py-0.5 text-base text-foreground"
                    />
                  ) : (
                    <button
                      onClick={() => startEditKgi(k.id, k.current_value)}
                      className="text-base text-foreground hover:text-accent-bright transition-colors"
                    >
                      {fmt(k.current_value)}
                    </button>
                  )}
                  <span className="text-muted">→</span>
                  <span className="text-accent-bright">
                    {fmt(k.target_nov_2026)}
                  </span>
                  <span className="text-muted text-[11px]">{k.unit}</span>
                </div>
                {p && (
                  <div className="mt-2 h-1 overflow-hidden rounded-full bg-surface-2">
                    <div
                      className={cn(
                        "h-full transition-all",
                        p.status === "critical"
                          ? "bg-danger-bright"
                          : p.status === "behind"
                          ? "bg-warn"
                          : p.status === "ahead" || p.status === "done"
                          ? "bg-ok-bright"
                          : "bg-accent"
                      )}
                      style={{ width: `${Math.max(2, p.actualPct)}%` }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Шаги плана */}
      <section className="space-y-2">
        <h2 className="text-[11px] uppercase tracking-wider text-secondary">
          Шаги плана
        </h2>
        <div className="space-y-1.5">
          {steps.map((s) => {
            const left = differenceInCalendarDays(
              parseISO(s.deadline),
              today
            );
            const overdue = left < 0;
            const due = left <= 14;
            return (
              <div
                key={s.id}
                className="rounded-md border border-border bg-surface px-3 py-2 flex items-center gap-3"
              >
                <span className="num text-[11px] text-muted w-12 shrink-0">
                  {s.id}
                </span>
                <span className="flex-1 min-w-0 text-[14px] text-foreground truncate">
                  {s.title}
                </span>
                <span
                  className={cn(
                    "num text-[11px] shrink-0",
                    overdue
                      ? "text-danger-bright"
                      : due
                      ? "text-warn"
                      : "text-muted"
                  )}
                >
                  {overdue ? `−${-left}` : `+${left}`} дн.
                </span>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
