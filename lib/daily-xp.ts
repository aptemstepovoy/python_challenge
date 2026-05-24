import type { DailyXPEntry } from "./types";

export function todayISO(d: Date = new Date()): string {
  return d.toISOString().slice(0, 10);
}

export function xpForToday(
  history: DailyXPEntry[],
  date: string = todayISO()
): number {
  return history.find((e) => e.date === date)?.xp ?? 0;
}

export function addDailyXP(
  history: DailyXPEntry[],
  amount: number,
  date: string = todayISO()
): DailyXPEntry[] {
  const idx = history.findIndex((e) => e.date === date);
  if (idx === -1) {
    return [...history, { date, xp: amount }];
  }
  const next = [...history];
  next[idx] = { ...next[idx], xp: next[idx].xp + amount };
  return next;
}

export function markGoalHit(
  history: DailyXPEntry[],
  date: string = todayISO()
): DailyXPEntry[] {
  const idx = history.findIndex((e) => e.date === date);
  if (idx === -1) return history;
  if (history[idx].goalHit) return history;
  const next = [...history];
  next[idx] = { ...next[idx], goalHit: true };
  return next;
}

export function dailyGoalStreak(
  history: DailyXPEntry[],
  goal: number,
  today: Date = new Date()
): number {
  let count = 0;
  let cursor = new Date(today);
  while (count < 1000) {
    const iso = cursor.toISOString().slice(0, 10);
    const entry = history.find((e) => e.date === iso);
    if (entry && entry.xp >= goal) {
      count += 1;
      cursor.setDate(cursor.getDate() - 1);
    } else {
      // allow today not to count down yet
      if (count === 0 && iso === today.toISOString().slice(0, 10)) {
        cursor.setDate(cursor.getDate() - 1);
        continue;
      }
      break;
    }
  }
  return count;
}
