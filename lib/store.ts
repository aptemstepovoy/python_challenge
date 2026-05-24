"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  AchievementId,
  AchievementSnapshot,
  ChestReward,
  DailyJournal,
  DailyQuestsSnapshot,
  DailyXPEntry,
  DropEvent,
  Habit,
  HabitLog,
  Insight,
  InventoryEntry,
  ItemId,
  KGI,
  Status,
  Step,
  TalentId,
  TalentRank,
  Task,
  WeeklyReview,
  WeightEntry,
} from "./types";
import {
  initialHabits,
  initialKGIs,
  initialSteps,
  initialTasks,
} from "./initial-data";
import { uuid } from "./utils";
import { habitStreak } from "./habits-logic";
import { addDailyXP } from "./daily-xp";
import { generateQuestsForDate } from "./quests";
import { computeModifiers, getTalent } from "./talents";
import { DROP_CHANCE, getItem, rollLoot } from "./loot";
import { levelFromXP } from "./xp";

type State = {
  kgis: KGI[];
  steps: Step[];
  tasks: Task[];
  reviews: WeeklyReview[];
  weightEntries: WeightEntry[];
  habits: Habit[];
  habitLogs: HabitLog[];
  xp: number;
  achievements: AchievementSnapshot[];
  lastIntroDate: string | null;
  snoozesUsedDate: string | null;
  snoozesUsedCount: number;
  journals: DailyJournal[];
  insights: Insight[];
  activeTimerTaskId: string | null;
  activeTimerStartedAt: string | null;
  // v5 dopamine
  dailyXPGoal: number;
  dailyXPHistory: DailyXPEntry[];
  lastChestOpened: string | null;
  chestStreak: number;
  totalChestsOpened: number;
  chestHistory: ChestReward[];
  dailyQuests: DailyQuestsSnapshot[];
  streakFreezes: number;
  streakFreezesEarned: number;
  talentPoints: number;
  talentPointsEarned: number;
  talents: TalentRank[];
  inventory: InventoryEntry[];
  recentDrops: DropEvent[];
  lastLevelClaimed: number;

  setKGI: (id: string, current_value: number | string) => void;
  setTaskStatus: (id: string, status: Status) => void;
  cycleTaskStatus: (id: string) => void;
  updateTask: (id: string, patch: Partial<Task>) => void;
  addTask: (task: Omit<Task, "id"> & { id?: string }) => void;
  startTask: (id: string) => void;
  completeTask: (id: string) => void;
  snoozeTask: (id: string) => boolean;
  deleteTask: (id: string) => void;

  addReview: (review: Omit<WeeklyReview, "id">) => void;
  addWeightEntry: (entry: WeightEntry) => void;

  toggleHabit: (habit_id: string, date?: string) => void;
  addHabitLog: (log: Omit<HabitLog, "id">) => void;
  removeHabitLog: (log_id: string) => void;
  addHabit: (habit: Omit<Habit, "id" | "created_at" | "archived">) => void;
  archiveHabit: (id: string) => void;
  unarchiveHabit: (id: string) => void;
  deleteHabit: (id: string) => void;
  updateHabit: (id: string, patch: Partial<Habit>) => void;

  addXP: (amount: number) => void;
  unlockAchievement: (id: AchievementId) => void;
  markIntroSeen: () => void;
  addJournal: (journal: Omit<DailyJournal, "id" | "created_at">) => void;
  updateJournal: (id: string, patch: Partial<DailyJournal>) => void;
  deleteJournal: (id: string) => void;
  addInsight: (insight: Omit<Insight, "id" | "created_at">) => void;
  deleteInsight: (id: string) => void;
  startTimer: (task_id: string) => void;
  stopTimer: () => void;

  openDailyChest: () => ChestReward | null;
  completeQuest: (questId: string) => void;
  ensureQuestsForToday: () => void;

  spendTalent: (id: TalentId) => boolean;
  refundTalent: (id: TalentId) => boolean;
  consumeRecentDrop: (id: string) => void;
  useItem: (itemId: ItemId) => boolean;
  awardItem: (itemId: ItemId) => void;
  claimLevelRewards: () => void;

  resetData: () => void;
};

const STATUS_CYCLE: Record<Status, Status> = {
  todo: "in_progress",
  in_progress: "done",
  done: "todo",
  blocked: "todo",
};

const todayISO = () => new Date().toISOString().slice(0, 10);
const nowISO = () => new Date().toISOString();

function streakMultiplier(streak: number, boost: number = 0): number {
  if (streak >= 30) return 1.5 + boost;
  if (streak >= 7) return 1.25 + boost;
  if (streak >= 3) return 1.1 + boost;
  return 1.0;
}

function rollLootAndRecord(
  state: State,
  baseChance: number,
  source: string
): { inventory: InventoryEntry[]; recentDrops: DropEvent[] } | null {
  const mods = computeModifiers(state.talents);
  const effective = baseChance + mods.lootQualityShift * 0.1;
  const itemId = rollLoot(effective, mods.lootQualityShift);
  if (!itemId) return null;
  const existing = state.inventory.find((i) => i.itemId === itemId);
  const ts = new Date().toISOString();
  const inv: InventoryEntry[] = existing
    ? state.inventory.map((i) =>
        i.itemId === itemId ? { ...i, count: i.count + 1, acquired_at: ts } : i
      )
    : [...state.inventory, { itemId, count: 1, acquired_at: ts }];
  // import getItem dynamically to avoid circular — we'll resolve rarity via items list ID prefix lookup later
  const it = getItem(itemId);
  const drop: DropEvent = {
    id: uuid(),
    itemId,
    rarity: it?.rarity ?? "common",
    ts,
  };
  return {
    inventory: inv,
    recentDrops: [drop, ...state.recentDrops].slice(0, 12),
  };
}

const CHEST_TIERS: Array<{ tier: ChestReward["tier"]; xp: number }> = [
  { tier: "common", xp: 15 },
  { tier: "uncommon", xp: 40 },
  { tier: "rare", xp: 100 },
  { tier: "epic", xp: 300 },
  { tier: "legendary", xp: 1000 },
];

function rollChest(tierShift: number = 0): ChestReward {
  const r = Math.random();
  let idx = 0;
  if (r < 0.6) idx = 0;
  else if (r < 0.85) idx = 1;
  else if (r < 0.95) idx = 2;
  else if (r < 0.99) idx = 3;
  else idx = 4;
  if (tierShift > 0 && Math.random() < tierShift && idx < CHEST_TIERS.length - 1) {
    idx += 1;
  }
  const t = CHEST_TIERS[idx];
  return { tier: t.tier, xp: t.xp, date: todayISO() };
}

export const useStore = create<State>()(
  persist(
    (set, get) => ({
      kgis: initialKGIs,
      steps: initialSteps,
      tasks: initialTasks,
      reviews: [],
      weightEntries: [],
      habits: initialHabits,
      habitLogs: [],
      xp: 0,
      achievements: [],
      lastIntroDate: null,
      snoozesUsedDate: null,
      snoozesUsedCount: 0,
      journals: [],
      insights: [],
      activeTimerTaskId: null,
      activeTimerStartedAt: null,

      dailyXPGoal: 30,
      dailyXPHistory: [],
      lastChestOpened: null,
      chestStreak: 0,
      totalChestsOpened: 0,
      chestHistory: [],
      dailyQuests: [],
      streakFreezes: 0,
      streakFreezesEarned: 0,
      talentPoints: 0,
      talentPointsEarned: 0,
      talents: [],
      inventory: [],
      recentDrops: [],
      lastLevelClaimed: 1,

      setKGI: (id, current_value) =>
        set((s) => ({
          kgis: s.kgis.map((k) =>
            k.id === id ? { ...k, current_value } : k
          ),
        })),

      setTaskStatus: (id, status) =>
        set((s) => ({
          tasks: s.tasks.map((t) =>
            t.id === id
              ? {
                  ...t,
                  status,
                  completed_at: status === "done" ? nowISO() : t.completed_at,
                  started_at:
                    status === "in_progress" && !t.started_at
                      ? nowISO()
                      : t.started_at,
                }
              : t
          ),
        })),

      cycleTaskStatus: (id) =>
        set((s) => {
          const mods = computeModifiers(s.talents);
          let xpDelta = 0;
          let rolledLoot = false;
          const tasks = s.tasks.map((t) => {
            if (t.id !== id) return t;
            const next = STATUS_CYCLE[t.status];
            if (t.status !== "done" && next === "done") {
              const base = t.xp ?? 25;
              const focusBonus =
                (t.time_spent_sec ?? 0) >= 25 * 60 ? mods.focusBonus : 0;
              xpDelta += Math.round(base * mods.taskXPMult * (1 + focusBonus));
              rolledLoot = true;
            }
            if (t.status === "done" && next !== "done") xpDelta -= t.xp ?? 25;
            return {
              ...t,
              status: next,
              completed_at: next === "done" ? nowISO() : t.completed_at,
              started_at:
                next === "in_progress" && !t.started_at
                  ? nowISO()
                  : t.started_at,
            };
          });
          const loot = rolledLoot
            ? rollLootAndRecord(s, DROP_CHANCE.task, "task")
            : null;
          return {
            tasks,
            xp: Math.max(0, s.xp + xpDelta),
            dailyXPHistory:
              xpDelta > 0
                ? addDailyXP(s.dailyXPHistory, xpDelta)
                : s.dailyXPHistory,
            ...(loot ?? {}),
          };
        }),

      updateTask: (id, patch) =>
        set((s) => ({
          tasks: s.tasks.map((t) => (t.id === id ? { ...t, ...patch } : t)),
        })),

      addTask: (task) =>
        set((s) => ({
          tasks: [
            ...s.tasks,
            {
              ...task,
              id: task.id ?? `${task.step_id}.${uuid().slice(0, 4)}`,
              status: task.status ?? "todo",
              xp: task.xp ?? 25,
            } as Task,
          ],
        })),

      startTask: (id) =>
        set((s) => ({
          tasks: s.tasks.map((t) =>
            t.id === id
              ? {
                  ...t,
                  status: "in_progress",
                  started_at: t.started_at ?? nowISO(),
                  snoozed_until: undefined,
                }
              : t
          ),
        })),

      completeTask: (id) =>
        set((s) => {
          const mods = computeModifiers(s.talents);
          let xpDelta = 0;
          let rolledLoot = false;
          const tasks = s.tasks.map((t) => {
            if (t.id !== id) return t;
            if (t.status !== "done") {
              const base = t.xp ?? 25;
              const focusBonus =
                (t.time_spent_sec ?? 0) >= 25 * 60 ? mods.focusBonus : 0;
              xpDelta += Math.round(base * mods.taskXPMult * (1 + focusBonus));
              rolledLoot = true;
            }
            return {
              ...t,
              status: "done" as Status,
              completed_at: nowISO(),
              snoozed_until: undefined,
            };
          });
          const loot = rolledLoot
            ? rollLootAndRecord(s, DROP_CHANCE.task, "task")
            : null;
          return {
            tasks,
            xp: s.xp + xpDelta,
            dailyXPHistory:
              xpDelta > 0
                ? addDailyXP(s.dailyXPHistory, xpDelta)
                : s.dailyXPHistory,
            ...(loot ?? {}),
          };
        }),

      deleteTask: (id) =>
        set((s) => ({
          tasks: s.tasks.filter((t) => t.id !== id),
        })),

      snoozeTask: (id) => {
        const s = get();
        const today = todayISO();
        const usedToday =
          s.snoozesUsedDate === today ? s.snoozesUsedCount : 0;
        if (usedToday >= 3) return false;
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const dateISO = tomorrow.toISOString().slice(0, 10);
        set({
          tasks: s.tasks.map((t) =>
            t.id === id ? { ...t, snoozed_until: dateISO } : t
          ),
          snoozesUsedDate: today,
          snoozesUsedCount: usedToday + 1,
        });
        return true;
      },

      addReview: (review) =>
        set((s) => {
          const newReview: WeeklyReview = { ...review, id: uuid() };
          const next: State["weightEntries"] = [...s.weightEntries];
          let kgis = s.kgis;
          if (review.weight_kg != null && !Number.isNaN(review.weight_kg)) {
            next.push({ date: review.date, weight_kg: review.weight_kg });
            kgis = s.kgis.map((k) =>
              k.id === "weight"
                ? { ...k, current_value: review.weight_kg! }
                : k
            );
          }
          const gain = 100;
          return {
            reviews: [newReview, ...s.reviews],
            weightEntries: next,
            kgis,
            xp: s.xp + gain,
            dailyXPHistory: addDailyXP(s.dailyXPHistory, gain),
          };
        }),

      addWeightEntry: (entry) =>
        set((s) => ({
          weightEntries: [...s.weightEntries, entry],
          kgis: s.kgis.map((k) =>
            k.id === "weight" ? { ...k, current_value: entry.weight_kg } : k
          ),
        })),

      toggleHabit: (habit_id, date) =>
        set((s) => {
          const d = date ?? todayISO();
          const existing = s.habitLogs.find(
            (l) => l.habit_id === habit_id && l.date === d
          );
          const habit = s.habits.find((h) => h.id === habit_id);
          if (existing) {
            return {
              habitLogs: s.habitLogs.filter((l) => l.id !== existing.id),
              xp: Math.max(0, s.xp - (habit?.xp_per_completion ?? 0)),
            };
          }
          const mods = computeModifiers(s.talents);
          const streak = habitStreak(s.habitLogs, habit_id, new Date(d));
          const mult = streakMultiplier(streak, mods.streakMultBoost);
          const base = habit?.xp_per_completion ?? 0;
          const earned = Math.round(base * mult * mods.habitXPMult);
          const newLog: HabitLog = {
            id: uuid(),
            habit_id,
            date: d,
            completed_at: nowISO(),
          };
          const loot = rollLootAndRecord(s, DROP_CHANCE.habit, "habit");
          return {
            habitLogs: [...s.habitLogs, newLog],
            xp: s.xp + earned,
            dailyXPHistory: addDailyXP(s.dailyXPHistory, earned),
            ...(loot ?? {}),
          };
        }),

      addHabitLog: (log) =>
        set((s) => ({
          habitLogs: [...s.habitLogs, { ...log, id: uuid() }],
        })),

      removeHabitLog: (log_id) =>
        set((s) => ({
          habitLogs: s.habitLogs.filter((l) => l.id !== log_id),
        })),

      addHabit: (h) =>
        set((s) => ({
          habits: [
            ...s.habits,
            {
              ...h,
              id: `h${s.habits.length + 1}-${uuid().slice(0, 4)}`,
              created_at: todayISO(),
              archived: false,
            },
          ],
        })),

      archiveHabit: (id) =>
        set((s) => ({
          habits: s.habits.map((h) =>
            h.id === id ? { ...h, archived: true } : h
          ),
        })),

      unarchiveHabit: (id) =>
        set((s) => ({
          habits: s.habits.map((h) =>
            h.id === id ? { ...h, archived: false } : h
          ),
        })),

      deleteHabit: (id) =>
        set((s) => ({
          habits: s.habits.filter((h) => h.id !== id),
          habitLogs: s.habitLogs.filter((l) => l.habit_id !== id),
        })),

      updateHabit: (id, patch) =>
        set((s) => ({
          habits: s.habits.map((h) => (h.id === id ? { ...h, ...patch } : h)),
        })),

      addXP: (amount) =>
        set((s) => ({
          xp: Math.max(0, s.xp + amount),
          dailyXPHistory:
            amount > 0 ? addDailyXP(s.dailyXPHistory, amount) : s.dailyXPHistory,
        })),

      unlockAchievement: (id) =>
        set((s) => {
          if (s.achievements.some((a) => a.id === id)) return {};
          // find reward_xp from ACHIEVEMENTS at call site, but here we lock to 100 default
          // Caller-driven: ACHIEVEMENTS list determines reward, but here a base bonus
          const bonus = 100;
          return {
            achievements: [
              ...s.achievements,
              { id, unlocked_at: nowISO() },
            ],
            xp: s.xp + bonus,
            dailyXPHistory: addDailyXP(s.dailyXPHistory, bonus),
          };
        }),

      markIntroSeen: () => set({ lastIntroDate: todayISO() }),

      addJournal: (j) =>
        set((s) => {
          const gain = 30;
          return {
            journals: [
              { ...j, id: uuid(), created_at: nowISO() },
              ...s.journals,
            ],
            xp: s.xp + gain,
            dailyXPHistory: addDailyXP(s.dailyXPHistory, gain),
          };
        }),

      updateJournal: (id, patch) =>
        set((s) => ({
          journals: s.journals.map((j) =>
            j.id === id ? { ...j, ...patch } : j
          ),
        })),

      deleteJournal: (id) =>
        set((s) => ({
          journals: s.journals.filter((j) => j.id !== id),
        })),

      addInsight: (ins) =>
        set((s) => {
          const gain = 10;
          return {
            insights: [
              { ...ins, id: uuid(), created_at: nowISO() },
              ...s.insights,
            ],
            xp: s.xp + gain,
            dailyXPHistory: addDailyXP(s.dailyXPHistory, gain),
          };
        }),

      deleteInsight: (id) =>
        set((s) => ({
          insights: s.insights.filter((i) => i.id !== id),
        })),

      startTimer: (task_id) =>
        set({
          activeTimerTaskId: task_id,
          activeTimerStartedAt: nowISO(),
        }),

      stopTimer: () => {
        const s = get();
        if (!s.activeTimerTaskId || !s.activeTimerStartedAt) return;
        const started = new Date(s.activeTimerStartedAt).getTime();
        const elapsedSec = Math.max(
          0,
          Math.round((Date.now() - started) / 1000)
        );
        set({
          activeTimerTaskId: null,
          activeTimerStartedAt: null,
          tasks: s.tasks.map((t) =>
            t.id === s.activeTimerTaskId
              ? {
                  ...t,
                  time_spent_sec: (t.time_spent_sec ?? 0) + elapsedSec,
                }
              : t
          ),
        });
      },

      openDailyChest: () => {
        const s = get();
        const today = todayISO();
        if (s.lastChestOpened === today) return null;
        const mods = computeModifiers(s.talents);
        const reward = rollChest(mods.chestTierShift);
        // Double-dip: chance to roll again and merge XP
        let bonus: ChestReward | null = null;
        if (mods.chestDoubleChance > 0 && Math.random() < mods.chestDoubleChance) {
          bonus = rollChest(mods.chestTierShift);
        }
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yISO = yesterday.toISOString().slice(0, 10);
        const newStreak = s.lastChestOpened === yISO ? s.chestStreak + 1 : 1;
        const totalXP = reward.xp + (bonus?.xp ?? 0);
        set({
          lastChestOpened: today,
          chestStreak: newStreak,
          totalChestsOpened: s.totalChestsOpened + 1 + (bonus ? 1 : 0),
          chestHistory: [
            ...(bonus ? [bonus] : []),
            reward,
            ...s.chestHistory,
          ].slice(0, 30),
          xp: s.xp + totalXP,
          dailyXPHistory: addDailyXP(s.dailyXPHistory, totalXP),
        });
        return reward;
      },

      ensureQuestsForToday: () => {
        const s = get();
        const today = todayISO();
        if (s.dailyQuests.find((q) => q.date === today)) return;
        const mods = computeModifiers(s.talents);
        const quests = generateQuestsForDate(today, mods.extraQuest);
        set({
          dailyQuests: [
            { date: today, quests, rewarded: false },
            ...s.dailyQuests,
          ].slice(0, 30),
        });
      },

      completeQuest: (questId) =>
        set((s) => {
          const today = todayISO();
          const snap = s.dailyQuests.find((q) => q.date === today);
          if (!snap) return {};
          const updated = snap.quests.map((q) =>
            q.id === questId ? { ...q, completed: true } : q
          );
          const allDone = updated.every((q) => q.completed);
          const bonus = allDone && !snap.rewarded ? 50 : 0;
          return {
            dailyQuests: s.dailyQuests.map((d) =>
              d.date === today
                ? { ...d, quests: updated, rewarded: snap.rewarded || allDone }
                : d
            ),
            xp: bonus > 0 ? s.xp + bonus : s.xp,
            dailyXPHistory:
              bonus > 0 ? addDailyXP(s.dailyXPHistory, bonus) : s.dailyXPHistory,
          };
        }),

      spendTalent: (id) => {
        const s = get();
        if (s.talentPoints <= 0) return false;
        const def = getTalent(id);
        if (!def) return false;
        const existing = s.talents.find((t) => t.id === id);
        const rank = existing?.rank ?? 0;
        if (rank >= def.maxRank) return false;
        const nextTalents = existing
          ? s.talents.map((t) =>
              t.id === id ? { ...t, rank: rank + 1 } : t
            )
          : [...s.talents, { id, rank: 1 }];
        set({
          talents: nextTalents,
          talentPoints: s.talentPoints - 1,
        });
        return true;
      },

      refundTalent: (id) => {
        const s = get();
        const existing = s.talents.find((t) => t.id === id);
        if (!existing || existing.rank <= 0) return false;
        const nextTalents = s.talents
          .map((t) =>
            t.id === id ? { ...t, rank: t.rank - 1 } : t
          )
          .filter((t) => t.rank > 0);
        set({
          talents: nextTalents,
          talentPoints: s.talentPoints + 1,
        });
        return true;
      },

      consumeRecentDrop: (id) =>
        set((s) => ({
          recentDrops: s.recentDrops.filter((d) => d.id !== id),
        })),

      awardItem: (itemId) =>
        set((s) => {
          const existing = s.inventory.find((i) => i.itemId === itemId);
          const ts = nowISO();
          const inv: InventoryEntry[] = existing
            ? s.inventory.map((i) =>
                i.itemId === itemId
                  ? { ...i, count: i.count + 1, acquired_at: ts }
                  : i
              )
            : [...s.inventory, { itemId, count: 1, acquired_at: ts }];
          return { inventory: inv };
        }),

      useItem: (itemId) => {
        const s = get();
        const entry = s.inventory.find((i) => i.itemId === itemId);
        if (!entry || entry.count <= 0) return false;
        const dec = (): InventoryEntry[] =>
          s.inventory
            .map((i) =>
              i.itemId === itemId ? { ...i, count: i.count - 1 } : i
            )
            .filter((i) => i.count > 0);
        switch (itemId) {
          case "extra_freeze":
            set({
              streakFreezes: Math.min(5, s.streakFreezes + 1),
              streakFreezesEarned: s.streakFreezesEarned + 1,
              inventory: dec(),
            });
            return true;
          case "quest_reroll": {
            const today = todayISO();
            const mods = computeModifiers(s.talents);
            const quests = generateQuestsForDate(
              today + "-r" + Math.random().toString(36).slice(2, 6),
              mods.extraQuest
            );
            set({
              dailyQuests: [
                { date: today, quests, rewarded: false },
                ...s.dailyQuests.filter((q) => q.date !== today),
              ].slice(0, 30),
              inventory: dec(),
            });
            return true;
          }
          case "xp_potion":
            set({
              xp: s.xp + 200,
              dailyXPHistory: addDailyXP(s.dailyXPHistory, 200),
              inventory: dec(),
            });
            return true;
          case "chest_key": {
            const mods = computeModifiers(s.talents);
            const reward = rollChest(mods.chestTierShift);
            set({
              chestHistory: [reward, ...s.chestHistory].slice(0, 30),
              totalChestsOpened: s.totalChestsOpened + 1,
              xp: s.xp + reward.xp,
              dailyXPHistory: addDailyXP(s.dailyXPHistory, reward.xp),
              inventory: dec(),
            });
            return true;
          }
          default:
            return false;
        }
      },

      claimLevelRewards: () => {
        const s = get();
        const curLevel = levelFromXP(s.xp).num;
        if (curLevel <= s.lastLevelClaimed) return;
        const points = curLevel - s.lastLevelClaimed;
        set({
          talentPoints: s.talentPoints + points,
          talentPointsEarned: s.talentPointsEarned + points,
          lastLevelClaimed: curLevel,
        });
      },

      resetData: () =>
        set({
          kgis: initialKGIs,
          steps: initialSteps,
          tasks: initialTasks,
          reviews: [],
          weightEntries: [],
          habits: initialHabits,
          habitLogs: [],
          xp: 0,
          achievements: [],
          lastIntroDate: null,
          snoozesUsedDate: null,
          snoozesUsedCount: 0,
          journals: [],
          insights: [],
          activeTimerTaskId: null,
          activeTimerStartedAt: null,
          dailyXPGoal: 30,
          dailyXPHistory: [],
          lastChestOpened: null,
          chestStreak: 0,
          totalChestsOpened: 0,
          chestHistory: [],
          dailyQuests: [],
          streakFreezes: 0,
          streakFreezesEarned: 0,
          talentPoints: 0,
          talentPointsEarned: 0,
          talents: [],
          inventory: [],
          recentDrops: [],
          lastLevelClaimed: 1,
        }),
    }),
    {
      name: "operator-store-v8",
      version: 8,
    }
  )
);
