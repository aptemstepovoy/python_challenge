export type Level = {
  num: number;
  title: string;
  min: number;
  max: number;
};

export const LEVELS: Level[] = [
  { num: 1, title: "Новичок", min: 0, max: 500 },
  { num: 2, title: "Оператор", min: 500, max: 1500 },
  { num: 3, title: "Архитектор", min: 1500, max: 3500 },
  { num: 4, title: "Стратег", min: 3500, max: 7000 },
  { num: 5, title: "Свободный", min: 7000, max: Infinity },
];

export function levelFromXP(xp: number): Level {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (xp >= LEVELS[i].min) return LEVELS[i];
  }
  return LEVELS[0];
}

export function nextLevelFromXP(xp: number): Level | null {
  const cur = levelFromXP(xp);
  if (cur.num >= LEVELS.length) return null;
  return LEVELS[cur.num] ?? null;
}

export function progressWithinLevel(xp: number): number {
  const lvl = levelFromXP(xp);
  if (!Number.isFinite(lvl.max)) return 100;
  const span = lvl.max - lvl.min;
  if (span <= 0) return 100;
  return Math.max(0, Math.min(100, ((xp - lvl.min) / span) * 100));
}

export function xpToNextLevel(xp: number): number {
  const lvl = levelFromXP(xp);
  if (!Number.isFinite(lvl.max)) return 0;
  return Math.max(0, lvl.max - xp);
}
