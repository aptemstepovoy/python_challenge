"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  AchievementId,
  AchievementSnapshot,
  DailyJournal,
  Habit,
  HabitLog,
  KGI,
  Status,
  Step,
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
  activeTimerTaskId: string | null;
  activeTimerStartedAt: string | null;

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
  startTimer: (task_id: string) => void;
  stopTimer: () => void;
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
      activeTimerTaskId: null,
      activeTimerStartedAt: null,

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
          let xpDelta = 0;
          const tasks = s.tasks.map((t) => {
            if (t.id !== id) return t;
            const next = STATUS_CYCLE[t.status];
            if (t.status !== "done" && next === "done") xpDelta += t.xp ?? 25;
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
          return { tasks, xp: Math.max(0, s.xp + xpDelta) };
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
          let xpDelta = 0;
          const tasks = s.tasks.map((t) => {
            if (t.id !== id) return t;
            if (t.status !== "done") xpDelta += t.xp ?? 25;
            return {
              ...t,
              status: "done" as Status,
              completed_at: nowISO(),
              snoozed_until: undefined,
            };
          });
          return { tasks, xp: s.xp + xpDelta };
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
          return {
            reviews: [newReview, ...s.reviews],
            weightEntries: next,
            kgis,
            xp: s.xp + 100,
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
          const newLog: HabitLog = {
            id: uuid(),
            habit_id,
            date: d,
            completed_at: nowISO(),
          };
          return {
            habitLogs: [...s.habitLogs, newLog],
            xp: s.xp + (habit?.xp_per_completion ?? 0),
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

      addXP: (amount) => set((s) => ({ xp: Math.max(0, s.xp + amount) })),

      unlockAchievement: (id) =>
        set((s) => {
          if (s.achievements.some((a) => a.id === id)) return {};
          return {
            achievements: [
              ...s.achievements,
              { id, unlocked_at: nowISO() },
            ],
            xp: s.xp + 100,
          };
        }),

      markIntroSeen: () => set({ lastIntroDate: todayISO() }),

      addJournal: (j) =>
        set((s) => ({
          journals: [
            { ...j, id: uuid(), created_at: nowISO() },
            ...s.journals,
          ],
          xp: s.xp + 30,
        })),

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
          activeTimerTaskId: null,
          activeTimerStartedAt: null,
        }),
    }),
    {
      name: "operator-store-v6",
      version: 6,
    }
  )
);
