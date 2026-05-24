import type { TalentId } from "./types";

export type TalentBranch = "discipline" | "velocity" | "fortune" | "mastery";

export type TalentEffect =
  | { type: "habit_xp_mult"; value: number }
  | { type: "task_xp_mult"; value: number }
  | { type: "chest_tier_shift"; value: number }
  | { type: "chest_double_chance"; value: number }
  | { type: "extra_freeze_slots"; value: number }
  | { type: "extra_quest"; value: number }
  | { type: "focus_bonus"; value: number }
  | { type: "perfect_day_bonus_xp"; value: number }
  | { type: "boss_damage_mult"; value: number }
  | { type: "streak_mult_boost"; value: number }
  | { type: "loot_quality_shift"; value: number };

export type TalentDef = {
  id: TalentId;
  name: string;
  branch: TalentBranch;
  tier: 1 | 2 | 3;
  maxRank: number;
  description: (rank: number) => string;
  effects: (rank: number) => TalentEffect[];
};

export const TALENTS: TalentDef[] = [
  // ───── Discipline (привычки) ─────
  {
    id: "spark",
    name: "Огонёк",
    branch: "discipline",
    tier: 1,
    maxRank: 3,
    description: (r) => `Привычки дают +${r * 5}% XP`,
    effects: (r) => [{ type: "habit_xp_mult", value: 1 + r * 0.05 }],
  },
  {
    id: "winter_stash",
    name: "Зимний запас",
    branch: "discipline",
    tier: 2,
    maxRank: 2,
    description: (r) => `+${r} слот для freeze-токенов (макс ${3 + r})`,
    effects: (r) => [{ type: "extra_freeze_slots", value: r }],
  },
  {
    id: "streak_lord",
    name: "Стрик-Лорд",
    branch: "discipline",
    tier: 3,
    maxRank: 1,
    description: () => `Streak-множитель +0.1 на каждой ступени (×1.20/×1.35/×1.60)`,
    effects: (r) => [{ type: "streak_mult_boost", value: r * 0.1 }],
  },

  // ───── Velocity (задачи) ─────
  {
    id: "swift_hand",
    name: "Быстрая рука",
    branch: "velocity",
    tier: 1,
    maxRank: 3,
    description: (r) => `Задачи дают +${r * 5}% XP`,
    effects: (r) => [{ type: "task_xp_mult", value: 1 + r * 0.05 }],
  },
  {
    id: "focus_burn",
    name: "Фокус",
    branch: "velocity",
    tier: 2,
    maxRank: 2,
    description: (r) => `Задача с таймером ≥25 мин даёт +${r * 15}% XP`,
    effects: (r) => [{ type: "focus_bonus", value: r * 0.15 }],
  },
  {
    id: "warlord",
    name: "Стратег",
    branch: "velocity",
    tier: 3,
    maxRank: 1,
    description: () => `+15% урона по боссам за задачи`,
    effects: (r) => [{ type: "boss_damage_mult", value: 1 + r * 0.15 }],
  },

  // ───── Fortune (удача / сундуки / лут) ─────
  {
    id: "luck",
    name: "Удачник",
    branch: "fortune",
    tier: 1,
    maxRank: 3,
    description: (r) =>
      `Шанс улучшить тир сундука на +${r * 5}% (uncommon → rare и т.д.)`,
    effects: (r) => [{ type: "chest_tier_shift", value: r * 0.05 }],
  },
  {
    id: "double_dip",
    name: "Двойная находка",
    branch: "fortune",
    tier: 2,
    maxRank: 1,
    description: () => `10% шанс открыть сундук дважды`,
    effects: (r) => [{ type: "chest_double_chance", value: r * 0.1 }],
  },
  {
    id: "looter",
    name: "Мародёр",
    branch: "fortune",
    tier: 3,
    maxRank: 2,
    description: (r) =>
      `+${r * 10}% к качеству лута (шанс шага редкости вверх)`,
    effects: (r) => [{ type: "loot_quality_shift", value: r * 0.1 }],
  },

  // ───── Mastery (стрики / квесты) ─────
  {
    id: "ritual",
    name: "Ритуал",
    branch: "mastery",
    tier: 1,
    maxRank: 1,
    description: () => `+1 дневной квест (4 вместо 3)`,
    effects: (r) => [{ type: "extra_quest", value: r }],
  },
  {
    id: "ideal",
    name: "Идеал",
    branch: "mastery",
    tier: 2,
    maxRank: 3,
    description: (r) => `Каждый идеальный день даёт +${r * 10} XP`,
    effects: (r) => [{ type: "perfect_day_bonus_xp", value: r * 10 }],
  },
  {
    id: "ascendant",
    name: "Возвышенный",
    branch: "mastery",
    tier: 3,
    maxRank: 1,
    description: () => `Все привычки дают +10% XP (стак с Огоньком)`,
    effects: () => [{ type: "habit_xp_mult", value: 1.1 }],
  },
];

export function getTalent(id: TalentId): TalentDef | undefined {
  return TALENTS.find((t) => t.id === id);
}

export type TalentModifiers = {
  habitXPMult: number;
  taskXPMult: number;
  chestTierShift: number;
  chestDoubleChance: number;
  extraFreezeSlots: number;
  extraQuest: number;
  focusBonus: number;
  perfectDayBonusXP: number;
  bossDamageMult: number;
  streakMultBoost: number;
  lootQualityShift: number;
};

export function computeModifiers(
  ranks: Array<{ id: TalentId; rank: number }>
): TalentModifiers {
  const mods: TalentModifiers = {
    habitXPMult: 1,
    taskXPMult: 1,
    chestTierShift: 0,
    chestDoubleChance: 0,
    extraFreezeSlots: 0,
    extraQuest: 0,
    focusBonus: 0,
    perfectDayBonusXP: 0,
    bossDamageMult: 1,
    streakMultBoost: 0,
    lootQualityShift: 0,
  };

  for (const { id, rank } of ranks) {
    if (rank <= 0) continue;
    const def = getTalent(id);
    if (!def) continue;
    for (const eff of def.effects(rank)) {
      switch (eff.type) {
        case "habit_xp_mult":
          mods.habitXPMult *= eff.value;
          break;
        case "task_xp_mult":
          mods.taskXPMult *= eff.value;
          break;
        case "chest_tier_shift":
          mods.chestTierShift += eff.value;
          break;
        case "chest_double_chance":
          mods.chestDoubleChance += eff.value;
          break;
        case "extra_freeze_slots":
          mods.extraFreezeSlots += eff.value;
          break;
        case "extra_quest":
          mods.extraQuest += eff.value;
          break;
        case "focus_bonus":
          mods.focusBonus += eff.value;
          break;
        case "perfect_day_bonus_xp":
          mods.perfectDayBonusXP += eff.value;
          break;
        case "boss_damage_mult":
          mods.bossDamageMult *= eff.value;
          break;
        case "streak_mult_boost":
          mods.streakMultBoost += eff.value;
          break;
        case "loot_quality_shift":
          mods.lootQualityShift += eff.value;
          break;
      }
    }
  }

  return mods;
}

export const BRANCH_META: Record<
  TalentBranch,
  { label: string; color: string; icon: string }
> = {
  discipline: { label: "Дисциплина", color: "#c4b5fd", icon: "✦" },
  velocity: { label: "Скорость", color: "#67e8f9", icon: "▲" },
  fortune: { label: "Удача", color: "#fcd34d", icon: "✺" },
  mastery: { label: "Мастерство", color: "#f472b6", icon: "❖" },
};
