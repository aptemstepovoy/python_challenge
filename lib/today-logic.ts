import { addDays, differenceInCalendarDays, parseISO } from "date-fns";
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
  return t.status !== "done" && t.status !== "inbox";
}

function notSnoozed(t: Task, today: Date): boolean {
  return !t.snoozed_until || parseISO(t.snoozed_until) <= today;
}

/**
 * Дата, до которой надо начать задачу, чтобы успеть к дедлайну.
 * mustStartBy = deadline - estimated_days
 */
export function mustStartBy(t: Task): Date {
  const days = Math.max(1, t.estimated_days ?? 1);
  return addDays(parseISO(t.deadline), -days);
}

/**
 * Запас в днях: сколько дней до точки старта.
 * 0 = старт сегодня, отрицательное = опаздываешь.
 */
export function slackDays(t: Task, today: Date = new Date()): number {
  return differenceInCalendarDays(mustStartBy(t), today);
}

export function nearestActiveBossId(today: Date = new Date()): string | null {
  const up = initialBosses
    .filter((b) => parseISO(b.target_date) >= today)
    .slice()
    .sort((a, b) => a.target_date.localeCompare(b.target_date));
  return up[0]?.id ?? null;
}

export type Priority = { task: Task; score: number; reasons: string[] };

function scoreTask(t: Task, today: Date, hotBoss: string | null): Priority {
  const slack = slackDays(t, today);
  let score = slack;
  const reasons: string[] = [];

  if (slack < 0) reasons.push(`Опаздываешь на ${-slack} дн.`);
  else if (slack === 0) reasons.push("Старт сегодня");
  else reasons.push(`${slack} дн. запас`);

  if (t.is_today_committed) {
    score -= 100;
    reasons.push("Взято на сегодня");
  }
  if (t.status === "in_progress") {
    score -= 5;
    reasons.push("В работе");
  }
  if (t.linked_boss && t.linked_boss === hotBoss) {
    score -= 8;
    reasons.push(
      `Босс ${initialBosses.find((b) => b.id === t.linked_boss)?.name}`
    );
  }
  score += STEP_PRIORITY[t.step_id] ?? 5;
  return { task: t, score, reasons };
}

/**
 * Задачи, относящиеся к "сегодня":
 *  - status открыт, не snoozed
 *  - start_date уже наступил
 *  - либо явно положена пользователем (is_today_committed),
 *    либо должна стартовать по slack (mustStartBy <= today)
 */
export function pickTodayTasks(
  tasks: Task[],
  today: Date = new Date()
): Task[] {
  const todayISO = today.toISOString().slice(0, 10);
  const cands = tasks.filter(
    (t) =>
      isOpen(t) &&
      notSnoozed(t, today) &&
      (t.start_date ?? todayISO) <= todayISO &&
      (t.is_today_committed || mustStartBy(t) <= today)
  );
  const hot = nearestActiveBossId(today);
  return cands
    .map((t) => scoreTask(t, today, hot))
    .sort((a, b) => a.score - b.score)
    .map((s) => s.task);
}

/**
 * Задачи в горизонте N дней — slack > 0 и slack <= horizonDays.
 * Используется для "Скоро на стол".
 */
export function pickHorizonTasks(
  tasks: Task[],
  today: Date = new Date(),
  horizonDays = 7
): Task[] {
  return tasks
    .filter(
      (t) =>
        isOpen(t) &&
        notSnoozed(t, today) &&
        slackDays(t, today) > 0 &&
        slackDays(t, today) <= horizonDays
    )
    .sort((a, b) => slackDays(a, today) - slackDays(b, today));
}

/**
 * Подсказки для утреннего ритуала: «что предложить выбрать на сегодня».
 * Объединяет сегодняшние + ближайший горизонт. Без дублей. Ограничение по N.
 */
export function pickSuggestedForToday(
  tasks: Task[],
  today: Date = new Date(),
  limit = 8
): Task[] {
  const candidates = [
    ...pickTodayTasks(tasks, today),
    ...pickHorizonTasks(tasks, today, 14),
  ];
  return Array.from(
    new Map(candidates.map((t) => [t.id, t])).values()
  ).slice(0, limit);
}

/**
 * Эвристика длительности задачи по сходным закрытым задачам того же шага.
 * Использует разрыв completed_at - committed_at. Если данных < 3 — возвращает 1.
 */
export function suggestEstimateDays(stepId: string, tasks: Task[]): number {
  const closed = tasks.filter(
    (t) => t.step_id === stepId && t.completed_at && t.committed_at
  );
  if (closed.length < 3) return 1;
  const avg =
    closed.reduce((acc, t) => {
      const days = differenceInCalendarDays(
        parseISO(t.completed_at!),
        parseISO(t.committed_at!)
      );
      return acc + Math.max(1, days);
    }, 0) / closed.length;
  return Math.max(1, Math.ceil(avg));
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

/**
 * Самая важная задача сегодня — первая из pickTodayTasks.
 * Если ничего нет — null.
 */
export function pickMainTask(
  tasks: Task[],
  today: Date = new Date()
): Task | null {
  return pickTodayTasks(tasks, today)[0] ?? null;
}
