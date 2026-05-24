import type { ItemId, Rarity } from "./types";

export type ItemKind = "shard" | "cosmetic" | "consumable" | "trophy";

export type ItemDef = {
  id: ItemId;
  name: string;
  rarity: Rarity;
  kind: ItemKind;
  description: string;
  icon: string; // emoji-ish glyph used in SVG / text
};

export const ITEMS: ItemDef[] = [
  // Shards (common dust used for nothing yet, but collect)
  {
    id: "shard_violet",
    name: "Аметистовый осколок",
    rarity: "common",
    kind: "shard",
    description: "Маленький фиолетовый кристалл. Светится тихо.",
    icon: "◆",
  },
  {
    id: "shard_cyan",
    name: "Лазурный осколок",
    rarity: "common",
    kind: "shard",
    description: "Холодный синий блеск.",
    icon: "❖",
  },
  {
    id: "shard_pink",
    name: "Розовый осколок",
    rarity: "common",
    kind: "shard",
    description: "Тёплое розовое сияние.",
    icon: "✦",
  },

  // Cosmetics — titles / colors / frames
  {
    id: "title_pathfinder",
    name: "Титул «Следопыт»",
    rarity: "uncommon",
    kind: "cosmetic",
    description: "Звание для тех, кто ищет дорогу сам.",
    icon: "✧",
  },
  {
    id: "title_nocturnal",
    name: "Титул «Полуночный»",
    rarity: "uncommon",
    kind: "cosmetic",
    description: "Когда лучше всего работается после полуночи.",
    icon: "☾",
  },
  {
    id: "aura_violet",
    name: "Фиолетовая аура",
    rarity: "uncommon",
    kind: "cosmetic",
    description: "Тонкое сияние вокруг аватара.",
    icon: "◉",
  },
  {
    id: "aura_gold",
    name: "Золотая аура",
    rarity: "rare",
    kind: "cosmetic",
    description: "Тяжёлое золото вокруг плаща.",
    icon: "✺",
  },
  {
    id: "frame_obsidian",
    name: "Обсидиановая рамка",
    rarity: "rare",
    kind: "cosmetic",
    description: "Тёмный, тяжёлый край портрета.",
    icon: "▰",
  },
  {
    id: "title_wanderer",
    name: "Титул «Странник Бали»",
    rarity: "rare",
    kind: "cosmetic",
    description: "Звание для тех, кто живёт на двух берегах.",
    icon: "🌴",
  },

  // Consumables
  {
    id: "extra_freeze",
    name: "Дополнительная заморозка",
    rarity: "uncommon",
    kind: "consumable",
    description: "+1 freeze-токен. Расходуется при использовании.",
    icon: "❄",
  },
  {
    id: "quest_reroll",
    name: "Свиток замены квеста",
    rarity: "uncommon",
    kind: "consumable",
    description: "Перегенерировать дневные квесты.",
    icon: "⟲",
  },
  {
    id: "xp_potion",
    name: "Эликсир опыта",
    rarity: "rare",
    kind: "consumable",
    description: "Мгновенно +200 XP.",
    icon: "⚗",
  },
  {
    id: "chest_key",
    name: "Ключ удачи",
    rarity: "rare",
    kind: "consumable",
    description: "Открыть бонусный сундук сейчас.",
    icon: "⚷",
  },

  // Legendary trophies — non-consumable, set bonus / vanity
  {
    id: "trophy_first_boss",
    name: "Трофей: Первый босс",
    rarity: "legendary",
    kind: "trophy",
    description: "Сияющий памятник первой большой победе.",
    icon: "♛",
  },
  {
    id: "crown_eternal",
    name: "Вечная корона",
    rarity: "legendary",
    kind: "cosmetic",
    description: "Тяжёлая, не давит. Видна только тебе.",
    icon: "♚",
  },
];

const RARITY_WEIGHT: Record<Rarity, number> = {
  common: 70,
  uncommon: 22,
  rare: 6,
  epic: 1.5,
  legendary: 0.5,
};

const RARITY_ORDER: Rarity[] = [
  "common",
  "uncommon",
  "rare",
  "epic",
  "legendary",
];

export function rollRarity(qualityShift: number = 0): Rarity {
  const total = Object.values(RARITY_WEIGHT).reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  let rolled: Rarity = "common";
  for (const rar of RARITY_ORDER) {
    r -= RARITY_WEIGHT[rar];
    if (r <= 0) {
      rolled = rar;
      break;
    }
  }
  // qualityShift: chance to bump one tier up
  if (qualityShift > 0 && Math.random() < qualityShift) {
    const idx = RARITY_ORDER.indexOf(rolled);
    if (idx < RARITY_ORDER.length - 1) {
      rolled = RARITY_ORDER[idx + 1];
    }
  }
  return rolled;
}

/**
 * Attempt to drop loot from a task or habit completion.
 * Returns null if no drop, or the item id.
 */
export function rollLoot(
  baseChance: number,
  qualityShift: number = 0
): ItemId | null {
  if (Math.random() > baseChance) return null;
  const rarity = rollRarity(qualityShift);
  const pool = ITEMS.filter((i) => i.rarity === rarity);
  if (pool.length === 0) return null;
  return pool[Math.floor(Math.random() * pool.length)].id;
}

export function getItem(id: ItemId): ItemDef | undefined {
  return ITEMS.find((i) => i.id === id);
}

export const RARITY_COLOR: Record<Rarity, string> = {
  common: "#a39bb8",
  uncommon: "#67e8f9",
  rare: "#c084fc",
  epic: "#f472b6",
  legendary: "#fbbf24",
};

export const RARITY_LABEL: Record<Rarity, string> = {
  common: "обычный",
  uncommon: "необычный",
  rare: "редкий",
  epic: "эпический",
  legendary: "легендарный",
};

// Base drop chances
export const DROP_CHANCE = {
  task: 0.25, // 25% per task close
  habit: 0.12, // 12% per habit log
  review: 0.5, // 50% per weekly review
  perfect_day: 0.6, // 60% on perfect day milestone
};
