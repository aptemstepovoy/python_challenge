import {
  addDays,
  differenceInCalendarDays,
  format,
  parseISO,
  startOfWeek,
} from "date-fns";
import type { Habit, HabitLog } from "./types";

export function isHabitActive(habit: Habit, today: Date = new Date()): boolean {
  if (habit.archived) return false;
  if (habit.active_until) {
    const end = parseISO(habit.active_until);
    if (today > end) return false;
  }
  return true;
}

export function logForToday(
  logs: HabitLog[],
  habit_id: string,
  date: string
): HabitLog | undefined {
  return logs.find((l) => l.habit_id === habit_id && l.date === date);
}

export function logsInWeek(
  logs: HabitLog[],
  habit_id: string,
  today: Date = new Date()
): HabitLog[] {
  const start = startOfWeek(today, { weekStartsOn: 1 });
  const end = addDays(start, 7);
  return logs.filter((l) => {
    if (l.habit_id !== habit_id) return false;
    const d = parseISO(l.date);
    return d >= start && d < end;
  });
}

export function habitStreak(
  logs: HabitLog[],
  habit_id: string,
  today: Date = new Date()
): number {
  const dates = new Set(
    logs.filter((l) => l.habit_id === habit_id).map((l) => l.date)
  );
  let current = 0;
  let cursor = today;
  if (!dates.has(format(cursor, "yyyy-MM-dd"))) {
    cursor = addDays(cursor, -1);
  }
  while (dates.has(format(cursor, "yyyy-MM-dd"))) {
    current += 1;
    cursor = addDays(cursor, -1);
  }
  return current;
}

export function dailyHabits(habits: Habit[], today: Date = new Date()): Habit[] {
  return habits.filter(
    (h) => h.frequency === "daily" && isHabitActive(h, today)
  );
}

export function weeklyHabits(habits: Habit[], today: Date = new Date()): Habit[] {
  return habits.filter(
    (h) =>
      (h.frequency === "weekly_n" || h.frequency === "custom_days") &&
      isHabitActive(h, today)
  );
}

/**
 * Should this habit appear on the "today" surface?
 * - daily: yes unless completed today
 * - weekly_n: yes unless this week's count hit target OR completed today
 * - custom_days: yes only on selected days, unless completed today
 */
export function shouldShowToday(
  habit: Habit,
  logs: HabitLog[],
  today: Date = new Date()
): boolean {
  if (!isHabitActive(habit, today)) return false;
  const todayISO = format(today, "yyyy-MM-dd");
  if (logForToday(logs, habit.id, todayISO)) return false;

  if (habit.frequency === "daily") return true;
  if (habit.frequency === "weekly_n") {
    const done = logsInWeek(logs, habit.id, today).length;
    return done < habit.target_per_week;
  }
  if (habit.frequency === "custom_days") {
    const dow = today.getDay();
    return !!habit.days_of_week?.includes(dow);
  }
  return false;
}

/** All habits to display on /today, after frequency + completion filtering */
export function visibleTodayHabits(
  habits: Habit[],
  logs: HabitLog[],
  today: Date = new Date()
): Habit[] {
  return habits.filter((h) => shouldShowToday(h, logs, today));
}

export function todayCompletionRatio(
  habits: Habit[],
  logs: HabitLog[],
  today: Date = new Date()
): { done: number; total: number } {
  const d = format(today, "yyyy-MM-dd");
  const daily = dailyHabits(habits, today);
  const done = daily.filter((h) => logForToday(logs, h.id, d)).length;
  return { done, total: daily.length };
}

export type HeatmapCell = {
  date: string;
  ratio: number;
  doneCount: number;
  total: number;
};

export function buildHeatmap(
  habits: Habit[],
  logs: HabitLog[],
  weeks: number = 12,
  today: Date = new Date()
): HeatmapCell[][] {
  const cols: HeatmapCell[][] = [];
  const todayStart = startOfWeek(today, { weekStartsOn: 1 });
  const firstWeek = addDays(todayStart, -7 * (weeks - 1));

  for (let w = 0; w < weeks; w++) {
    const weekStart = addDays(firstWeek, 7 * w);
    const col: HeatmapCell[] = [];
    for (let d = 0; d < 7; d++) {
      const day = addDays(weekStart, d);
      const dayISO = format(day, "yyyy-MM-dd");
      const dailyActive = habits.filter(
        (h) => h.frequency === "daily" && isHabitActive(h, day)
      );
      const done = dailyActive.filter((h) =>
        logForToday(logs, h.id, dayISO)
      ).length;
      const ratio = dailyActive.length ? done / dailyActive.length : 0;
      col.push({ date: dayISO, ratio, doneCount: done, total: dailyActive.length });
    }
    cols.push(col);
  }
  return cols;
}

export function isPerfectDay(
  habits: Habit[],
  logs: HabitLog[],
  date: Date = new Date()
): boolean {
  const dailyActive = habits.filter(
    (h) => h.frequency === "daily" && isHabitActive(h, date)
  );
  if (dailyActive.length === 0) return false;
  const d = format(date, "yyyy-MM-dd");
  return dailyActive.every((h) => logForToday(logs, h.id, d));
}

export function perfectDaysStreak(
  habits: Habit[],
  logs: HabitLog[],
  today: Date = new Date()
): number {
  let count = 0;
  let cursor = today;
  if (!isPerfectDay(habits, logs, cursor)) {
    cursor = addDays(cursor, -1);
  }
  while (isPerfectDay(habits, logs, cursor)) {
    count += 1;
    cursor = addDays(cursor, -1);
    if (differenceInCalendarDays(today, cursor) > 365) break;
  }
  return count;
}
