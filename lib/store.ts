"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  KGI,
  Status,
  Step,
  Task,
  WeeklyReview,
  WeightEntry,
} from "./types";
import { initialKGIs, initialSteps, initialTasks } from "./initial-data";
import { uuid } from "./utils";

type State = {
  kgis: KGI[];
  steps: Step[];
  tasks: Task[];
  reviews: WeeklyReview[];
  weightEntries: WeightEntry[];

  setKGI: (id: string, current_value: number | string) => void;
  setTaskStatus: (id: string, status: Status) => void;
  cycleTaskStatus: (id: string) => void;
  updateTask: (id: string, patch: Partial<Task>) => void;
  addTask: (task: Omit<Task, "id"> & { id?: string }) => void;
  addReview: (review: Omit<WeeklyReview, "id">) => void;
  addWeightEntry: (entry: WeightEntry) => void;
  resetData: () => void;
};

const STATUS_CYCLE: Record<Status, Status> = {
  todo: "in_progress",
  in_progress: "done",
  done: "todo",
  blocked: "todo",
};

export const useStore = create<State>()(
  persist(
    (set) => ({
      kgis: initialKGIs,
      steps: initialSteps,
      tasks: initialTasks,
      reviews: [],
      weightEntries: [],

      setKGI: (id, current_value) =>
        set((s) => ({
          kgis: s.kgis.map((k) =>
            k.id === id ? { ...k, current_value } : k
          ),
        })),

      setTaskStatus: (id, status) =>
        set((s) => ({
          tasks: s.tasks.map((t) => (t.id === id ? { ...t, status } : t)),
        })),

      cycleTaskStatus: (id) =>
        set((s) => ({
          tasks: s.tasks.map((t) =>
            t.id === id ? { ...t, status: STATUS_CYCLE[t.status] } : t
          ),
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

      addReview: (review) =>
        set((s) => {
          const newReview: WeeklyReview = { ...review, id: uuid() };
          const next: State["weightEntries"] = [...s.weightEntries];
          if (review.weight_kg != null && !Number.isNaN(review.weight_kg)) {
            next.push({ date: review.date, weight_kg: review.weight_kg });
            const kgis = s.kgis.map((k) =>
              k.id === "weight" ? { ...k, current_value: review.weight_kg! } : k
            );
            return { reviews: [newReview, ...s.reviews], weightEntries: next, kgis };
          }
          return { reviews: [newReview, ...s.reviews], weightEntries: next };
        }),

      addWeightEntry: (entry) =>
        set((s) => ({
          weightEntries: [...s.weightEntries, entry],
          kgis: s.kgis.map((k) =>
            k.id === "weight" ? { ...k, current_value: entry.weight_kg } : k
          ),
        })),

      resetData: () =>
        set({
          kgis: initialKGIs,
          steps: initialSteps,
          tasks: initialTasks,
          reviews: [],
          weightEntries: [],
        }),
    }),
    {
      name: "operator-store-v1",
      version: 1,
    }
  )
);
