"use client";

import { useMemo } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUp,
  Minus,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { useStore } from "@/lib/store";
import {
  kgiProgress,
  STATUS_BG,
  STATUS_COLOR,
  STATUS_LABEL,
  type KGIStatus,
} from "@/lib/mission-logic";
import { cn } from "@/lib/utils";

const PRIORITY = ["income", "weight", "subscribers"];

const KGI_LABEL: Record<string, string> = {
  income: "Доход",
  weight: "Вес",
  subscribers: "TG",
  english: "EN",
  clients: "Клиенты",
};

function StatusIcon({ status }: { status: KGIStatus }) {
  if (status === "done" || status === "ahead")
    return <TrendingUp className="h-3 w-3" />;
  if (status === "behind" || status === "critical")
    return <TrendingDown className="h-3 w-3" />;
  return <Minus className="h-3 w-3" />;
}

function formatValue(v: number | string): string {
  if (typeof v === "string") return v;
  if (v >= 10000) return v.toLocaleString("ru-RU");
  return String(v);
}

export function MissionStrip() {
  const kgis = useStore((s) => s.kgis);
  const today = useMemo(() => new Date(), []);

  const rows = useMemo(() => {
    const ordered = PRIORITY.map((id) => kgis.find((k) => k.id === id)).filter(
      (k): k is NonNullable<typeof k> => !!k
    );
    return ordered
      .map((k) => kgiProgress(k, today))
      .filter((p): p is NonNullable<typeof p> => !!p);
  }, [kgis, today]);

  if (rows.length === 0) return null;

  return (
    <Link href="/dashboard" className="block">
      <div className="flex items-center gap-2 mb-2 font-mono text-[10px] uppercase tracking-[0.2em] text-secondary">
        <span>◆ Миссия · ноябрь</span>
        <span className="flex-1" />
        <span className="flex items-center gap-1 text-muted hover:text-foreground">
          подробно <ArrowRight className="h-3 w-3" />
        </span>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {rows.map((p) => {
          const label = KGI_LABEL[p.kgi.id] ?? p.kgi.name;
          return (
            <div
              key={p.kgi.id}
              className={cn(
                "shrink-0 rounded-md border px-2.5 py-1.5 min-w-[150px]",
                STATUS_BG[p.status]
              )}
            >
              <div className="flex items-center justify-between gap-1">
                <span className="font-mono text-[10px] uppercase tracking-wider text-foreground">
                  {label}
                </span>
                <span
                  className={cn(
                    "flex items-center gap-1 font-mono text-[9px] uppercase tracking-wider",
                    STATUS_COLOR[p.status]
                  )}
                >
                  <StatusIcon status={p.status} />
                  {STATUS_LABEL[p.status]}
                </span>
              </div>
              <div className="mt-1 num text-sm text-foreground">
                {formatValue(p.kgi.current_value)}
                <span className="text-muted text-[10px]"> → </span>
                <span className="text-accent-bright">
                  {formatValue(p.novTarget)}
                </span>
              </div>
              <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-surface-2">
                <div
                  className={cn(
                    "h-full transition-all",
                    p.status === "behind" || p.status === "critical"
                      ? "bg-warn"
                      : p.status === "ahead" || p.status === "done"
                      ? "bg-ok-bright"
                      : "bg-accent"
                  )}
                  style={{ width: `${Math.max(2, p.actualPct)}%` }}
                />
              </div>
              <div className="mt-1 font-mono text-[9px] uppercase tracking-wider text-muted num">
                {p.daysToTarget} дн.
              </div>
            </div>
          );
        })}
      </div>
    </Link>
  );
}
