import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { differenceInCalendarDays, format, parseISO } from "date-fns";
import { ru } from "date-fns/locale";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const PLAN_START = "2026-05-23";
export const TARGET_NOV = "2026-11-23";
export const TARGET_MAY = "2027-05-23";

export function daysSinceStart(today: Date = new Date()): number {
  return differenceInCalendarDays(today, parseISO(PLAN_START)) + 1;
}

/**
 * Per-account day counter. Returns 1 on the day the account was created,
 * 2 the next day, etc. Falls back to PLAN_START for legacy local-only mode.
 */
export function daysSinceAccountStart(
  accountStartDate: string | null,
  today: Date = new Date()
): number {
  const start = accountStartDate ?? PLAN_START;
  return Math.max(1, differenceInCalendarDays(today, parseISO(start)) + 1);
}

export function formatDateRu(date: string | Date): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  return format(d, "d MMM yyyy", { locale: ru });
}

export function formatWeekday(date: Date = new Date()): string {
  return format(date, "EEEE, d MMMM", { locale: ru });
}

export function isOverdue(deadline: string, today: Date = new Date()): boolean {
  return differenceInCalendarDays(parseISO(deadline), today) < 0;
}

export function isThisWeek(deadline: string, today: Date = new Date()): boolean {
  const diff = differenceInCalendarDays(parseISO(deadline), today);
  return diff >= 0 && diff <= 7;
}

export function isThisMonth(deadline: string, today: Date = new Date()): boolean {
  const diff = differenceInCalendarDays(parseISO(deadline), today);
  return diff >= 0 && diff <= 30;
}

export function deadlineCategory(
  deadline: string,
  today: Date = new Date()
): "overdue" | "week" | "month" | "later" {
  const diff = differenceInCalendarDays(parseISO(deadline), today);
  if (diff < 0) return "overdue";
  if (diff <= 7) return "week";
  if (diff <= 30) return "month";
  return "later";
}

export function progressToTarget(
  start: number,
  current: number,
  target: number,
  higherIsBetter: boolean
): number {
  if (target === start) return current === target ? 100 : 0;
  const ratio = higherIsBetter
    ? (current - start) / (target - start)
    : (start - current) / (start - target);
  return Math.max(0, Math.min(100, ratio * 100));
}

export function expectedProgress(
  startDate: string,
  targetDate: string,
  today: Date = new Date()
): number {
  const total = differenceInCalendarDays(parseISO(targetDate), parseISO(startDate));
  const elapsed = differenceInCalendarDays(today, parseISO(startDate));
  if (total <= 0) return 100;
  return Math.max(0, Math.min(100, (elapsed / total) * 100));
}

export function uuid(): string {
  return (
    Math.random().toString(36).slice(2, 10) +
    "-" +
    Date.now().toString(36)
  );
}
