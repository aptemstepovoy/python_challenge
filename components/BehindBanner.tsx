"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AlertTriangle, X } from "lucide-react";
import { useStore } from "@/lib/store";
import { kgiProgress } from "@/lib/mission-logic";

const KGI_LABEL: Record<string, string> = {
  income: "Доход",
  weight: "Вес",
  subscribers: "TG подписчики",
  english: "Английский",
  clients: "Клиенты",
};

/**
 * Красный алерт, если хотя бы один числовой KGI критически отстаёт.
 * Цель — сделать gap физически ощутимым, чтобы юзер не игнорировал.
 */
export function BehindBanner() {
  const kgis = useStore((s) => s.kgis);
  const today = useMemo(() => new Date(), []);
  const [dismissed, setDismissed] = useState(false);

  const critical = useMemo(() => {
    return kgis
      .map((k) => kgiProgress(k, today))
      .filter((p): p is NonNullable<typeof p> => !!p && p.status === "critical");
  }, [kgis, today]);

  if (dismissed || critical.length === 0) return null;

  const head = critical[0];
  const label = KGI_LABEL[head.kgi.id] ?? head.kgi.name;

  return (
    <Link
      href="/dashboard"
      className="flex items-start gap-3 rounded-md border border-danger/50 bg-danger/10 p-3 hover:bg-danger/15 transition-colors"
    >
      <AlertTriangle className="h-5 w-5 shrink-0 text-danger-bright" />
      <div className="flex-1 min-w-0">
        <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-danger-bright">
          ◆ Критически отстаёшь · {label}
        </div>
        <div className="text-sm text-foreground mt-0.5 leading-snug">
          Цель ноября:{" "}
          <span className="num">{String(head.novTarget)}</span>. Сейчас:{" "}
          <span className="num">{String(head.kgi.current_value)}</span>.
          Прошло{" "}
          <span className="num">{Math.round(head.expectedPct)}%</span>{" "}
          времени, выполнено{" "}
          <span className="num">{Math.round(head.actualPct)}%</span>.
        </div>
        <div className="font-mono text-[10px] uppercase tracking-wider text-secondary mt-1">
          до точки контроля{" "}
          <span className="num text-danger-bright">
            {head.daysToTarget}
          </span>{" "}
          дн. · откройте /dashboard
        </div>
      </div>
      <button
        onClick={(e) => {
          e.preventDefault();
          setDismissed(true);
        }}
        className="shrink-0 text-secondary hover:text-foreground"
        aria-label="Скрыть"
      >
        <X className="h-4 w-4" />
      </button>
    </Link>
  );
}
