import type { Quest, QuestId } from "./types";

type QuestDef = {
  id: QuestId;
  name: string;
  goal: number;
  tier: "easy" | "med" | "big";
};

const POOL: QuestDef[] = [
  { id: "close_task_1", name: "Закрой 1 задачу", goal: 1, tier: "easy" },
  { id: "habits_3", name: "Выполни 3 daily-привычки", goal: 3, tier: "easy" },
  { id: "open_chest", name: "Открой сундук", goal: 1, tier: "easy" },
  { id: "log_weight", name: "Залогни вес", goal: 1, tier: "easy" },

  { id: "close_task_3", name: "Закрой 3 задачи", goal: 3, tier: "med" },
  { id: "insight_1", name: "Запиши инсайт", goal: 1, tier: "med" },
  { id: "journal_1", name: "Сделай отчёт за день", goal: 1, tier: "med" },
  { id: "focus_25", name: "Фокус-таймер 25 минут", goal: 25, tier: "med" },

  { id: "perfect_day", name: "Идеальный день (все привычки)", goal: 1, tier: "big" },
  {
    id: "boss_damage_50",
    name: "Нанеси 50 урона ближайшему боссу",
    goal: 50,
    tier: "big",
  },
];

function hashDate(dateISO: string): number {
  let h = 5381;
  for (let i = 0; i < dateISO.length; i++) {
    h = ((h << 5) + h + dateISO.charCodeAt(i)) >>> 0;
  }
  return h;
}

function pickOne(arr: QuestDef[], seed: number, salt: number): QuestDef {
  return arr[(seed + salt * 31) % arr.length];
}

export function generateQuestsForDate(
  dateISO: string,
  extra: number = 0
): Quest[] {
  const easy = POOL.filter((q) => q.tier === "easy");
  const med = POOL.filter((q) => q.tier === "med");
  const big = POOL.filter((q) => q.tier === "big");
  const seed = hashDate(dateISO);
  const picks: QuestDef[] = [
    pickOne(easy, seed, 1),
    pickOne(med, seed, 7),
    pickOne(big, seed, 13),
  ];
  for (let i = 0; i < extra; i++) {
    picks.push(pickOne(easy, seed, 17 + i * 11));
  }
  return picks.map((q) => ({
    id: q.id,
    name: q.name,
    goal: q.goal,
    completed: false,
  }));
}

export const QUEST_BONUS_XP = 50;
