import { differenceInCalendarDays, parseISO } from "date-fns";
import type { KGI, Step } from "./types";
import { PLAN_START, TARGET_NOV } from "./utils";

export type KGIStatus = "ahead" | "on_track" | "behind" | "critical" | "done";

export type KGIProgress = {
  kgi: KGI;
  /** Текущий прогресс в процентах от стартовой точки до ноябрьской цели. */
  actualPct: number;
  /** Ожидаемый прогресс по календарю в процентах. */
  expectedPct: number;
  /** Разрыв в процентных пунктах: положительный = впереди графика. */
  gap: number;
  status: KGIStatus;
  /** Сколько единиц нужно ещё пройти до nov-target. */
  remaining: number;
  /** Дней до ближайшей контрольной точки. */
  daysToTarget: number;
  /** Целевое значение в ноябре. */
  novTarget: number | string;
};

function asNumber(v: number | string | undefined): number | null {
  if (v == null) return null;
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : null;
}

/**
 * Считает прогресс одного KGI относительно «ожидаемого по календарю».
 * Для строковых KGI (английский, локация) возвращает null.
 */
export function kgiProgress(
  kgi: KGI,
  today: Date = new Date()
): KGIProgress | null {
  const start = asNumber(kgi.start_value);
  const cur = asNumber(kgi.current_value);
  const target = asNumber(kgi.target_nov_2026);
  if (start == null || cur == null || target == null) return null;

  const totalSpan = target - start;
  if (totalSpan === 0) return null;

  const actualSpan = cur - start;
  const actualPct = (actualSpan / totalSpan) * 100;
  const expectedPct = expectedProgressPct(PLAN_START, TARGET_NOV, today);
  const gap = actualPct - expectedPct;

  let status: KGIStatus;
  if (actualPct >= 100) status = "done";
  else if (gap >= 5) status = "ahead";
  else if (gap >= -5) status = "on_track";
  else if (gap >= -20) status = "behind";
  else status = "critical";

  const daysToTarget = Math.max(
    0,
    differenceInCalendarDays(parseISO(TARGET_NOV), today)
  );
  const remaining = target - cur;

  return {
    kgi,
    actualPct: Math.max(0, Math.min(100, actualPct)),
    expectedPct,
    gap,
    status,
    remaining,
    daysToTarget,
    novTarget: kgi.target_nov_2026,
  };
}

function expectedProgressPct(
  startDate: string,
  targetDate: string,
  today: Date
): number {
  const total = differenceInCalendarDays(
    parseISO(targetDate),
    parseISO(startDate)
  );
  const elapsed = differenceInCalendarDays(today, parseISO(startDate));
  if (total <= 0) return 100;
  return Math.max(0, Math.min(100, (elapsed / total) * 100));
}

export type Milestone = {
  step: Step;
  daysLeft: number;
  isOverdue: boolean;
};

/**
 * Ближайший шаг с дедлайном в будущем (или просроченный недавно).
 */
export function nearestMilestone(
  steps: Step[],
  today: Date = new Date()
): Milestone | null {
  const sorted = steps
    .map((s) => ({
      step: s,
      daysLeft: differenceInCalendarDays(parseISO(s.deadline), today),
    }))
    .filter((m) => m.daysLeft >= -3) // ещё не сильно просрочен
    .sort((a, b) => a.daysLeft - b.daysLeft);
  if (sorted.length === 0) return null;
  const first = sorted[0];
  return {
    step: first.step,
    daysLeft: first.daysLeft,
    isOverdue: first.daysLeft < 0,
  };
}

export const STATUS_LABEL: Record<KGIStatus, string> = {
  done: "цель",
  ahead: "впереди",
  on_track: "по плану",
  behind: "отстаёт",
  critical: "критично",
};

export const STATUS_COLOR: Record<KGIStatus, string> = {
  done: "text-ok-bright",
  ahead: "text-ok-bright",
  on_track: "text-foreground",
  behind: "text-warn",
  critical: "text-danger-bright",
};

export const STATUS_BG: Record<KGIStatus, string> = {
  done: "bg-ok/10 border-ok/40",
  ahead: "bg-ok/10 border-ok/40",
  on_track: "bg-surface border-border",
  behind: "bg-warn/10 border-warn/40",
  critical: "bg-danger/10 border-danger/50",
};
