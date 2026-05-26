"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  DailyJournal,
  DailyPlan,
  Effort,
  EffortLog,
  EnergyLevel,
  Habit,
  HabitLog,
  Insight,
  KGI,
  Status,
  Step,
  Task,
  WeeklyReview,
  WeightEntry,
} from "./types";
import {
  initialEfforts,
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
  journals: DailyJournal[];
  insights: Insight[];
  activeTimerTaskId: string | null;
  activeTimerStartedAt: string | null;
  snoozesUsedDate: string | null;
  snoozesUsedCount: number;
  accountStartDate: string | null;
  vision: string;
  dailyPlans: DailyPlan[];
  efforts: Effort[];
  effortLogs: EffortLog[];
  dailyCapacityHours: number;
  preferredEnergyMorning: EnergyLevel;
  preferredEnergyAfternoon: EnergyLevel;
  preferredEnergyEvening: EnergyLevel;
  inboxTasks: string[];

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

  addJournal: (journal: Omit<DailyJournal, "id" | "created_at">) => void;
  updateJournal: (id: string, patch: Partial<DailyJournal>) => void;
  deleteJournal: (id: string) => void;

  addInsight: (insight: Omit<Insight, "id" | "created_at">) => void;
  deleteInsight: (id: string) => void;

  startTimer: (task_id: string) => void;
  stopTimer: () => void;

  commitTasksForToday: (
    taskIds: string[],
    mood?: EnergyLevel,
    intent?: string
  ) => void;
  uncommitTask: (taskId: string) => void;
  finalizeDay: (reflection?: string) => void;
  logEffort: (effortId: string, date?: string) => void;
  unlogEffort: (logId: string) => void;
  addEffort: (e: Omit<Effort, "id" | "created_at" | "archived">) => void;
  moveTaskToInbox: (taskId: string) => void;
  graduateFromInbox: (taskId: string, patch: Partial<Task>) => void;
  setDailyCapacity: (hours: number) => void;
  setVision: (vision: string) => void;

  resetData: () => void;
};

const STATUS_CYCLE: Record<Status, Status> = {
  inbox: "todo",
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
      journals: [],
      insights: [],
      activeTimerTaskId: null,
      activeTimerStartedAt: null,
      snoozesUsedDate: null,
      snoozesUsedCount: 0,
      accountStartDate: new Date().toISOString().slice(0, 10),
      vision:
        "К свободе через систему — Бали, $6000/мес, B2 English, форма 92 кг",
      dailyPlans: [],
      efforts: initialEfforts,
      effortLogs: [],
      dailyCapacityHours: 4,
      preferredEnergyMorning: "high",
      preferredEnergyAfternoon: "medium",
      preferredEnergyEvening: "low",
      inboxTasks: [],

      setKGI: (id, current_value) =>
        set((s) => ({
          kgis: s.kgis.map((k) => (k.id === id ? { ...k, current_value } : k)),
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
                  is_today_committed:
                    status === "done" ? false : t.is_today_committed,
                }
              : t
          ),
        })),

      cycleTaskStatus: (id) =>
        set((s) => ({
          tasks: s.tasks.map((t) => {
            if (t.id !== id) return t;
            const next = STATUS_CYCLE[t.status];
            return {
              ...t,
              status: next,
              completed_at: next === "done" ? nowISO() : t.completed_at,
              started_at:
                next === "in_progress" && !t.started_at
                  ? nowISO()
                  : t.started_at,
              is_today_committed:
                next === "done" ? false : t.is_today_committed,
            };
          }),
        })),

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
        set((s) => ({
          tasks: s.tasks.map((t) =>
            t.id === id
              ? {
                  ...t,
                  status: "done" as Status,
                  completed_at: nowISO(),
                  snoozed_until: undefined,
                  is_today_committed: false,
                }
              : t
          ),
        })),

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
          const next: WeightEntry[] = [...s.weightEntries];
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
          if (existing) {
            return {
              habitLogs: s.habitLogs.filter((l) => l.id !== existing.id),
            };
          }
          const newLog: HabitLog = {
            id: uuid(),
            habit_id,
            date: d,
            completed_at: nowISO(),
          };
          return { habitLogs: [...s.habitLogs, newLog] };
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

      addJournal: (j) =>
        set((s) => ({
          journals: [
            { ...j, id: uuid(), created_at: nowISO() },
            ...s.journals,
          ],
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

      addInsight: (ins) =>
        set((s) => ({
          insights: [
            { ...ins, id: uuid(), created_at: nowISO() },
            ...s.insights,
          ],
        })),

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
              ? { ...t, time_spent_sec: (t.time_spent_sec ?? 0) + elapsedSec }
              : t
          ),
        });
      },

      commitTasksForToday: (taskIds, mood, intent) =>
        set((s) => {
          const today = todayISO();
          const ts = nowISO();
          const ids = taskIds.slice(0, 3);
          const plan: DailyPlan = {
            date: today,
            committed_task_ids: ids,
            mood,
            intent,
            created_at: ts,
          };
          return {
            dailyPlans: [
              plan,
              ...s.dailyPlans.filter((p) => p.date !== today),
            ].slice(0, 60),
            tasks: s.tasks.map((t) => {
              if (ids.includes(t.id)) {
                return { ...t, is_today_committed: true, committed_at: ts };
              }
              if (t.is_today_committed && !ids.includes(t.id)) {
                return { ...t, is_today_committed: false };
              }
              return t;
            }),
          };
        }),

      uncommitTask: (taskId) =>
        set((s) => ({
          tasks: s.tasks.map((t) =>
            t.id === taskId ? { ...t, is_today_committed: false } : t
          ),
          dailyPlans: s.dailyPlans.map((p) => {
            if (p.date !== todayISO()) return p;
            return {
              ...p,
              committed_task_ids: p.committed_task_ids.filter(
                (id) => id !== taskId
              ),
            };
          }),
        })),

      finalizeDay: (reflection) =>
        set((s) => {
          const today = todayISO();
          const existing = s.dailyPlans.find((p) => p.date === today);
          if (!existing) {
            const ts = nowISO();
            return {
              dailyPlans: [
                {
                  date: today,
                  committed_task_ids: [],
                  created_at: ts,
                  finalized_at: ts,
                  reflection,
                },
                ...s.dailyPlans,
              ].slice(0, 60),
            };
          }
          return {
            dailyPlans: s.dailyPlans.map((p) =>
              p.date === today
                ? { ...p, reflection, finalized_at: nowISO() }
                : p
            ),
          };
        }),

      logEffort: (effortId, date) =>
        set((s) => ({
          effortLogs: [
            ...s.effortLogs,
            {
              id: uuid(),
              effort_id: effortId,
              date: date ?? todayISO(),
              completed_at: nowISO(),
            },
          ],
        })),

      unlogEffort: (logId) =>
        set((s) => ({
          effortLogs: s.effortLogs.filter((l) => l.id !== logId),
        })),

      addEffort: (e) =>
        set((s) => ({
          efforts: [
            ...s.efforts,
            {
              ...e,
              id: `ef_${uuid().slice(0, 6)}`,
              created_at: todayISO(),
              archived: false,
            },
          ],
        })),

      moveTaskToInbox: (taskId) =>
        set((s) => ({
          tasks: s.tasks.map((t) =>
            t.id === taskId ? { ...t, status: "inbox" } : t
          ),
        })),

      graduateFromInbox: (taskId, patch) =>
        set((s) => ({
          tasks: s.tasks.map((t) =>
            t.id === taskId
              ? { ...t, ...patch, status: patch.status ?? "todo" }
              : t
          ),
        })),

      setDailyCapacity: (hours) =>
        set({
          dailyCapacityHours: Math.max(1, Math.min(16, Math.round(hours))),
        }),

      setVision: (vision) => set({ vision: vision.trim().slice(0, 240) }),

      resetData: () =>
        set({
          kgis: initialKGIs,
          steps: initialSteps,
          tasks: initialTasks,
          reviews: [],
          weightEntries: [],
          habits: initialHabits,
          habitLogs: [],
          journals: [],
          insights: [],
          activeTimerTaskId: null,
          activeTimerStartedAt: null,
          snoozesUsedDate: null,
          snoozesUsedCount: 0,
          accountStartDate: new Date().toISOString().slice(0, 10),
          dailyPlans: [],
          efforts: initialEfforts,
          effortLogs: [],
          dailyCapacityHours: 4,
          preferredEnergyMorning: "high",
          preferredEnergyAfternoon: "medium",
          preferredEnergyEvening: "low",
          inboxTasks: [],
          vision:
            "К свободе через систему — Бали, $6000/мес, B2 English, форма 92 кг",
        }),
    }),
    {
      name: "operator-store-v11",
      version: 11,
      migrate: (persisted: unknown) => {
        if (!persisted || typeof persisted !== "object") return persisted;
        const state = persisted as Record<string, unknown>;
        const inferDays = (t: Task) => {
          const xp = (t as Task & { xp?: number }).xp ?? 25;
          if (xp >= 75) return 7;
          if (xp >= 50) return 3;
          return 1;
        };
        if (Array.isArray(state.tasks)) {
          state.tasks = (state.tasks as Task[]).map((t) =>
            t.estimated_days ? t : { ...t, estimated_days: inferDays(t) }
          );
        }
        if (!state.dailyPlans) state.dailyPlans = [];
        if (!state.efforts) state.efforts = initialEfforts;
        if (!state.effortLogs) state.effortLogs = [];
        if (!state.dailyCapacityHours) state.dailyCapacityHours = 4;
        if (!state.preferredEnergyMorning) state.preferredEnergyMorning = "high";
        if (!state.preferredEnergyAfternoon)
          state.preferredEnergyAfternoon = "medium";
        if (!state.preferredEnergyEvening) state.preferredEnergyEvening = "low";
        if (!state.inboxTasks) state.inboxTasks = [];
        if (!state.vision)
          state.vision =
            "К свободе через систему — Бали, $6000/мес, B2 English, форма 92 кг";
        // удаляем deprecated геймификационные поля — zustand persist их игнорирует
        return state;
      },
    }
  )
);
