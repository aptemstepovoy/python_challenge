import { differenceInCalendarDays, parseISO } from "date-fns";
import type { Task } from "./types";
import { initialBosses } from "./initial-data";

const STEP_PRIORITY: Record<string, number> = {
  S1: 0,
  "S1.1": 2,
  "S1.2": 3,
  S2: 4,
  "S2.1": 5,
  S3: 6,
  S4: 8,
  S5: 10,
};

function isOpen(t: Task): boolean {
  return t.status !== "done";
}

function notSnoozed(t: Task, today: Date): boolean {
  if (!t.snoozed_until) return true;
  return parseISO(t.snoozed_until) <= today;
}

export function nearestActiveBossId(today: Date = new Date()): string | null {
  const upcoming = initialBosses
    .filter((b) => parseISO(b.target_date) >= today)
    .slice()
    .sort((a, b) => a.target_date.localeCompare(b.target_date));
  return upcoming[0]?.id ?? null;
}

export type Priority = {
  task: Task;
  score: number;
  reasons: string[];
};

function scoreTask(t: Task, today: Date, hotBoss: string | null): Priority {
  const reasons: string[] = [];
  let score: number;
  const days = differenceInCalendarDays(parseISO(t.deadline), today);

  if (days < 0) {
    score = -1000 + days;
    reasons.push(`Просрочено · ${-days} дн.`);
  } else if (days === 0) {
    score = 5;
    reasons.push("Дедлайн сегодня");
  } else if (days === 1) {
    score = 10;
    reasons.push("Дедлайн завтра");
  } else if (days <= 7) {
    score = 20 - days;
    reasons.push(`На этой неделе · через ${days} дн.`);
  } else if (days <= 30) {
    score = 40;
    reasons.push(`В этом месяце · ${days} дн.`);
  } else {
    score = 80;
  }

  if (t.status === "in_progress") {
    score -= 8;
    reasons.push("В работе");
  }

  if (t.linked_boss && hotBoss && t.linked_boss === hotBoss) {
    score -= 10;
    const bossName = initialBosses.find((b) => b.id === t.linked_boss)?.name
      ?? t.linked_boss;
    reasons.push(`Босс ${bossName}`);
  } else if (t.linked_boss) {
    const bossName = initialBosses.find((b) => b.id === t.linked_boss)?.name
      ?? t.linked_boss;
    reasons.push(`Босс ${bossName}`);
    score -= 2;
  }

  const stepWeight = STEP_PRIORITY[t.step_id] ?? 5;
  score += stepWeight;

  score -= (t.xp ?? 25) / 25;

  return { task: t, score, reasons };
}

export function pickTodayTask(
  tasks: Task[],
  today: Date = new Date()
): Task | null {
  const list = pickTodayTasks(tasks, today);
  return list[0] ?? null;
}

/**
 * Все задачи, которые «лежат на столе сегодня»:
 *  - start_date уже наступил (или сегодня)
 *  - status != done
 *  - не отложена до даты в будущем
 * Сортировка: просроченные → в работе → дедлайн сегодня → дедлайн скоро.
 */
export function pickTodayTasks(
  tasks: Task[],
  today: Date = new Date()
): Task[] {
  const todayISO = today.toISOString().slice(0, 10);
  const candidates = tasks.filter(
    (t) =>
      isOpen(t) &&
      notSnoozed(t, today) &&
      (t.start_date ?? todayISO) <= todayISO
  );
  if (candidates.length === 0) return [];
  const hot = nearestActiveBossId(today);
  const scored = candidates.map((t) => scoreTask(t, today, hot));
  scored.sort((a, b) => a.score - b.score);
  return scored.map((s) => s.task);
}

export function pickMainTask(
  tasks: Task[],
  today: Date = new Date()
): Task | null {
  const candidates = tasks.filter(
    (t) => isOpen(t) && notSnoozed(t, today)
  );
  if (candidates.length === 0) return null;
  const hot = nearestActiveBossId(today);
  const scored = candidates.map((t) => scoreTask(t, today, hot));
  scored.sort((a, b) => a.score - b.score);
  return scored[0].task;
}

export function pickPrioritiesWithReasons(
  tasks: Task[],
  exclude: string | null,
  count: number = 3,
  today: Date = new Date()
): Priority[] {
  const candidates = tasks.filter(
    (t) => isOpen(t) && t.id !== exclude && notSnoozed(t, today)
  );
  const hot = nearestActiveBossId(today);
  const scored = candidates.map((t) => scoreTask(t, today, hot));
  scored.sort((a, b) => a.score - b.score);
  return scored.slice(0, count);
}

export function pickTopPriorities(
  tasks: Task[],
  exclude: string | null,
  count: number = 3,
  today: Date = new Date()
): Task[] {
  return pickPrioritiesWithReasons(tasks, exclude, count, today).map(
    (p) => p.task
  );
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
