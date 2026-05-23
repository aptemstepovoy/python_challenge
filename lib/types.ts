export type Status = "todo" | "in_progress" | "done" | "blocked";

export type KGI = {
  id: string;
  name: string;
  unit: string;
  start_value: number | string;
  current_value: number | string;
  target_nov_2026: number | string;
  target_may_2027: number | string;
  higher_is_better?: boolean;
};

export type Step = {
  id: string;
  parent_id: string | null;
  title: string;
  start_date: string;
  deadline: string;
  description?: string;
};

export type Task = {
  id: string;
  step_id: string;
  title: string;
  start_date: string;
  deadline: string;
  status: Status;
  result_definition: string;
  xp?: number;
  linked_boss?: string;
  snoozed_until?: string;
  started_at?: string;
  completed_at?: string;
};

export type WeeklyReview = {
  id: string;
  date: string;
  weight_kg: number | null;
  posts_published: number | null;
  applications_sent: number | null;
  english_hours: number | null;
  blockers: string;
  wins: string;
};

export type WeightEntry = {
  date: string;
  weight_kg: number;
};

export type WeightTarget = {
  date: string;
  weight_kg: number;
};

export type HabitFrequency = "daily" | "weekly_n";

export type Habit = {
  id: string;
  name: string;
  icon: string;
  description: string;
  frequency: HabitFrequency;
  target_per_week: number;
  xp_per_completion: number;
  linked_kgi?: string;
  linked_boss?: string;
  color: string;
  created_at: string;
  archived: boolean;
  active_until?: string;
};

export type HabitLog = {
  id: string;
  habit_id: string;
  date: string;
  completed_at: string;
  note?: string;
};

export type Boss = {
  id: string;
  name: string;
  description: string;
  total_hp: number;
  reward_xp: number;
  start_date: string;
  target_date: string;
  damage_per_habit: number;
  unlocks_after?: string;
};

export type AchievementId =
  | "first_task"
  | "level_2"
  | "level_3"
  | "perfect_day"
  | "perfect_week"
  | "steel_30"
  | "content_100"
  | "polyglot_100h"
  | "athlete_50"
  | "outreach_master"
  | "clean_week_sugar"
  | "boss_naym"
  | "boss_bali"
  | "boss_telo"
  | "boss_product";

export type AchievementSnapshot = {
  id: AchievementId;
  unlocked_at: string;
};
