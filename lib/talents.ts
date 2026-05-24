import type { TalentId } from "./types";

export type TalentBranch = "discipline" | "velocity" | "fortune" | "mastery";

export type TalentEffect =
  | { type: "habit_xp_mult"; value: number }
  | { type: "task_xp_mult"; value: number }
  | { type: "chest_tier_shift"; value: number }
  | { type: "chest_double_chance"; value: number }
  | { type: "chest_guarantee_period"; value: number }
  | { type: "extra_freeze_slots"; value: number }
  | { type: "extra_quest"; value: number }
  | { type: "focus_bonus"; value: number }
  | { type: "deep_focus_bonus"; value: number }
  | { type: "perfect_day_bonus_xp"; value: number }
  | { type: "boss_damage_mult"; value: number }
  | { type: "streak_mult_boost"; value: number }
  | { type: "loot_quality_shift"; value: number }
  | { type: "loot_drop_bonus"; value: number }
  | { type: "quest_completion_mult"; value: number }
  | { type: "all_xp_mult"; value: number };

export type TalentDef = {
  id: TalentId;
  name: string;
  branch: TalentBranch;
  tier: 1 | 2 | 3;
  maxRank: number;
  description: (rank: number) => string;
  effects: (rank: number) => TalentEffect[];
};

export function costFor(tier: 1 | 2 | 3): number {
  return tier;
}

export const TALENTS: TalentDef[] = [
  // ───── Discipline ─────
  {
    id: "spark",
    name: "Огонёк",
    branch: "discipline",
    tier: 1,
    maxRank: 5,
    description: (r) => `Привычки дают +${r * 5}% XP`,
    effects: (r) => [{ type: "habit_xp_mult", value: 1 + r * 0.05 }],
  },
  {
    id: "morning_ritual",
    name: "Утренний ритуал",
    branch: "discipline",
    tier: 1,
    maxRank: 3,
    description: (r) => `Привычки дают ещё +${r * 3}% XP (стак)`,
    effects: (r) => [{ type: "habit_xp_mult", value: 1 + r * 0.03 }],
  },
  {
    id: "winter_stash",
    name: "Зимний запас",
    branch: "discipline",
    tier: 2,
    maxRank: 3,
    description: (r) => `+${r} слот для freeze-токенов (макс ${3 + r})`,
    effects: (r) => [{ type: "extra_freeze_slots", value: r }],
  },
  {
    id: "streak_lord",
    name: "Стрик-Лорд",
    branch: "discipline",
    tier: 3,
    maxRank: 2,
    description: (r) =>
      `Streak-множитель +${(r * 0.1).toFixed(2)} на каждой ступени`,
    effects: (r) => [{ type: "streak_mult_boost", value: r * 0.1 }],
  },
  {
    id: "ascendant",
    name: "Возвышенный",
    branch: "discipline",
    tier: 3,
    maxRank: 1,
    description: () => `Привычки дают ещё +10% XP (стак)`,
    effects: () => [{ type: "habit_xp_mult", value: 1.1 }],
  },

  // ───── Velocity ─────
  {
    id: "swift_hand",
    name: "Быстрая рука",
    branch: "velocity",
    tier: 1,
    maxRank: 5,
    description: (r) => `Задачи дают +${r * 5}% XP`,
    effects: (r) => [{ type: "task_xp_mult", value: 1 + r * 0.05 }],
  },
  {
    id: "speed_needle",
    name: "Скоростная игла",
    branch: "velocity",
    tier: 1,
    maxRank: 3,
    description: (r) => `Задачи дают ещё +${r * 3}% XP (стак)`,
    effects: (r) => [{ type: "task_xp_mult", value: 1 + r * 0.03 }],
  },
  {
    id: "focus_burn",
    name: "Фокус",
    branch: "velocity",
    tier: 2,
    maxRank: 3,
    description: (r) =>
      `Задача с таймером ≥25 мин даёт +${r * 15}% XP сверху`,
    effects: (r) => [{ type: "focus_bonus", value: r * 0.15 }],
  },
  {
    id: "deep_focus",
    name: "Глубина",
    branch: "velocity",
    tier: 2,
    maxRank: 1,
    description: () =>
      `Задача с таймером ≥60 мин даёт +50% XP сверху (стак с Фокусом)`,
    effects: () => [{ type: "deep_focus_bonus", value: 0.5 }],
  },
  {
    id: "warlord",
    name: "Стратег",
    branch: "velocity",
    tier: 3,
    maxRank: 2,
    description: (r) => `+${r * 15}% урона по боссам за задачи`,
    effects: (r) => [{ type: "boss_damage_mult", value: 1 + r * 0.15 }],
  },

  // ───── Fortune ─────
  {
    id: "luck",
    name: "Удачник",
    branch: "fortune",
    tier: 1,
    maxRank: 5,
    description: (r) =>
      `+${r * 5}% к шансу шага редкости сундука`,
    effects: (r) => [{ type: "chest_tier_shift", value: r * 0.05 }],
  },
  {
    id: "gatherer",
    name: "Сборщик",
    branch: "fortune",
    tier: 1,
    maxRank: 3,
    description: (r) => `+${r * 4}% к шансу выпадения лута`,
    effects: (r) => [{ type: "loot_drop_bonus", value: r * 0.04 }],
  },
  {
    id: "double_dip",
    name: "Двойная находка",
    branch: "fortune",
    tier: 2,
    maxRank: 1,
    description: () => `15% шанс открыть сундук дважды`,
    effects: () => [{ type: "chest_double_chance", value: 0.15 }],
  },
  {
    id: "prospector",
    name: "Старатель",
    branch: "fortune",
    tier: 2,
    maxRank: 1,
    description: () =>
      `Каждый 7-й сундук гарантирован не ниже редкого`,
    effects: () => [{ type: "chest_guarantee_period", value: 7 }],
  },
  {
    id: "looter",
    name: "Мародёр",
    branch: "fortune",
    tier: 3,
    maxRank: 3,
    description: (r) =>
      `+${r * 10}% к качеству лута (шанс шага редкости предмета)`,
    effects: (r) => [{ type: "loot_quality_shift", value: r * 0.1 }],
  },

  // ───── Mastery ─────
  {
    id: "ritual",
    name: "Ритуал",
    branch: "mastery",
    tier: 1,
    maxRank: 2,
    description: (r) =>
      r === 1 ? `+1 дневной квест (4 вместо 3)` : `+2 дневных квеста (5 всего)`,
    effects: (r) => [{ type: "extra_quest", value: r }],
  },
  {
    id: "alchemist",
    name: "Алхимик",
    branch: "mastery",
    tier: 1,
    maxRank: 3,
    description: (r) => `Идеальный день даёт +${r * 5} XP (стак с Идеалом)`,
    effects: (r) => [{ type: "perfect_day_bonus_xp", value: r * 5 }],
  },
  {
    id: "ideal",
    name: "Идеал",
    branch: "mastery",
    tier: 2,
    maxRank: 3,
    description: (r) => `Идеальный день даёт +${r * 15} XP`,
    effects: (r) => [{ type: "perfect_day_bonus_xp", value: r * 15 }],
  },
  {
    id: "double_reward",
    name: "Двойная награда",
    branch: "mastery",
    tier: 2,
    maxRank: 1,
    description: () => `Выполнение всех квестов даёт 150 XP вместо 50`,
    effects: () => [{ type: "quest_completion_mult", value: 3 }],
  },
  {
    id: "archon",
    name: "Архонт",
    branch: "mastery",
    tier: 3,
    maxRank: 1,
    description: () => `+10% ко всем XP-наградам`,
    effects: () => [{ type: "all_xp_mult", value: 1.1 }],
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
  chestGuaranteePeriod: number;
  extraFreezeSlots: number;
  extraQuest: number;
  focusBonus: number;
  deepFocusBonus: number;
  perfectDayBonusXP: number;
  bossDamageMult: number;
  streakMultBoost: number;
  lootQualityShift: number;
  lootDropBonus: number;
  questCompletionMult: number;
  allXPMult: number;
};

export function computeModifiers(
  ranks: Array<{ id: TalentId; rank: number }>
): TalentModifiers {
  const mods: TalentModifiers = {
    habitXPMult: 1,
    taskXPMult: 1,
    chestTierShift: 0,
    chestDoubleChance: 0,
    chestGuaranteePeriod: 0,
    extraFreezeSlots: 0,
    extraQuest: 0,
    focusBonus: 0,
    deepFocusBonus: 0,
    perfectDayBonusXP: 0,
    bossDamageMult: 1,
    streakMultBoost: 0,
    lootQualityShift: 0,
    lootDropBonus: 0,
    questCompletionMult: 1,
    allXPMult: 1,
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
        case "chest_guarantee_period":
          // pick the smallest non-zero period (most generous)
          mods.chestGuaranteePeriod =
            mods.chestGuaranteePeriod === 0
              ? eff.value
              : Math.min(mods.chestGuaranteePeriod, eff.value);
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
        case "deep_focus_bonus":
          mods.deepFocusBonus += eff.value;
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
        case "loot_drop_bonus":
          mods.lootDropBonus += eff.value;
          break;
        case "quest_completion_mult":
          mods.questCompletionMult *= eff.value;
          break;
        case "all_xp_mult":
          mods.allXPMult *= eff.value;
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
