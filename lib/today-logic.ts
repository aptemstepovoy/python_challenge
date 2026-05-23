import { parseISO } from "date-fns";
import type { Task } from "./types";

const STEP_PRIORITY: Record<string, number> = {
  S1: 0,
  "S1.1": 0.5,
  "S1.2": 0.6,
  S2: 1,
  "S2.1": 1.5,
  S3: 2,
  S4: 3,
  S5: 4,
};

function isOpen(t: Task): boolean {
  return t.status !== "done";
}

function notSnoozed(t: Task, today: Date): boolean {
  if (!t.snoozed_until) return true;
  return parseISO(t.snoozed_until) <= today;
}

export function pickMainTask(
  tasks: Task[],
  today: Date = new Date()
): Task | null {
  const candidates = tasks.filter(
    (t) => isOpen(t) && notSnoozed(t, today)
  );
  if (candidates.length === 0) return null;

  const todayISO = today.toISOString().slice(0, 10);

  const overdue = candidates
    .filter((t) => t.deadline < todayISO)
    .slice()
    .sort((a, b) => a.deadline.localeCompare(b.deadline));
  if (overdue.length > 0) return overdue[0];

  const dueToday = candidates.filter((t) => t.deadline === todayISO);
  if (dueToday.length > 0) {
    return dueToday.slice().sort((a, b) => (b.xp ?? 25) - (a.xp ?? 25))[0];
  }

  const weekEnd = new Date(today);
  weekEnd.setDate(weekEnd.getDate() + 7);
  const weekEndISO = weekEnd.toISOString().slice(0, 10);
  const thisWeek = candidates
    .filter((t) => t.deadline > todayISO && t.deadline <= weekEndISO)
    .slice()
    .sort((a, b) => {
      const ap =
        (STEP_PRIORITY[a.step_id] ?? 5) * 100 -
        (a.status === "in_progress" ? 50 : 0) -
        (a.xp ?? 25);
      const bp =
        (STEP_PRIORITY[b.step_id] ?? 5) * 100 -
        (b.status === "in_progress" ? 50 : 0) -
        (b.xp ?? 25);
      return ap - bp;
    });
  if (thisWeek.length > 0) return thisWeek[0];

  const sorted = candidates.slice().sort((a, b) => {
    const ap = STEP_PRIORITY[a.step_id] ?? 5;
    const bp = STEP_PRIORITY[b.step_id] ?? 5;
    if (ap !== bp) return ap - bp;
    return a.deadline.localeCompare(b.deadline);
  });
  return sorted[0];
}

export function pickTopPriorities(
  tasks: Task[],
  exclude: string | null,
  count: number = 3,
  today: Date = new Date()
): Task[] {
  const todayISO = today.toISOString().slice(0, 10);
  const candidates = tasks
    .filter(
      (t) => isOpen(t) && t.id !== exclude && notSnoozed(t, today)
    )
    .slice()
    .sort((a, b) => {
      const overdueA = a.deadline < todayISO ? 0 : 1;
      const overdueB = b.deadline < todayISO ? 0 : 1;
      if (overdueA !== overdueB) return overdueA - overdueB;
      const stepA = STEP_PRIORITY[a.step_id] ?? 5;
      const stepB = STEP_PRIORITY[b.step_id] ?? 5;
      if (stepA !== stepB) return stepA - stepB;
      return a.deadline.localeCompare(b.deadline);
    });
  return candidates.slice(0, count);
}

export function snoozesLeft(
  snoozesUsedDate: string | null,
  snoozesUsedCount: number,
  today: Date = new Date()
): number {
  const todayISO = today.toISOString().slice(0, 10);
  const used = snoozesUsedDate === todayISO ? snoozesUsedCount : 0;
  return Math.max(0, 3 - used);
}
