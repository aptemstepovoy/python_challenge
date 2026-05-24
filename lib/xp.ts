export type Level = {
  num: number;
  title: string;
  min: number;
  max: number;
};

const TITLES = [
  "Новичок",        // 1
  "Ученик",         // 2
  "Послушник",      // 3
  "Соискатель",     // 4
  "Оператор",       // 5
  "Координатор",    // 6
  "Исполнитель",    // 7
  "Архитектор",     // 8
  "Стратег",        // 9
  "Тактик",         // 10
  "Командир",       // 11
  "Мастер",         // 12
  "Хранитель",      // 13
  "Визионер",       // 14
  "Лидер",          // 15
  "Мудрец",         // 16
  "Аватар",         // 17
  "Архонт",         // 18
  "Освободитель",   // 19
  "Свободный",      // 20
];

const ROMAN = ["", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];

function titleFor(n: number): string {
  if (n <= TITLES.length) return TITLES[n - 1];
  // After level 20: "Свободный · I", "Свободный · II", ...
  const overflow = n - TITLES.length;
  return `Свободный · ${ROMAN[overflow] ?? overflow}`;
}

/**
 * Cumulative XP required to *reach* level n.
 * Formula: floor(50 * (n - 1)^2.2)
 *   L1 = 0, L2 = 50, L3 = 232, L4 = 589, L5 = 1148, L6 = 1922
 *   L10 = 7858, L15 = 22797, L20 = 47490
 */
function cumulativeXP(n: number): number {
  if (n <= 1) return 0;
  return Math.floor(50 * Math.pow(n - 1, 2.2));
}

const MAX_LEVEL = 30;

function buildLevels(): Level[] {
  const out: Level[] = [];
  for (let n = 1; n <= MAX_LEVEL; n++) {
    const min = cumulativeXP(n);
    const max = n < MAX_LEVEL ? cumulativeXP(n + 1) : Infinity;
    out.push({ num: n, title: titleFor(n), min, max });
  }
  return out;
}

export const LEVELS: Level[] = buildLevels();

export function levelFromXP(xp: number): Level {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (xp >= LEVELS[i].min) return LEVELS[i];
  }
  return LEVELS[0];
}

export function nextLevelFromXP(xp: number): Level | null {
  const cur = levelFromXP(xp);
  if (cur.num >= MAX_LEVEL) return null;
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
