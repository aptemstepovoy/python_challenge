export type Status = "inbox" | "todo" | "in_progress" | "done" | "blocked";

export type EnergyLevel = "low" | "medium" | "high";

export type PlannedSlot = "morning" | "afternoon" | "evening";

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
  xp?: number; // deprecated, kept for backwards compatibility
  linked_boss?: string; // deprecated
  snoozed_until?: string;
  started_at?: string;
  completed_at?: string;
  time_spent_sec?: number;
  estimated_days?: number;
  energy?: EnergyLevel;
  is_today_committed?: boolean;
  committed_at?: string;
  planned_slot?: PlannedSlot;
};

export type DailyPlan = {
  date: string;
  committed_task_ids: string[];
  mood?: EnergyLevel;
  intent?: string;
  created_at: string;
  finalized_at?: string;
  reflection?: string;
};

export type Effort = {
  id: string;
  title: string;
  step_id: string;
  start_date: string;
  end_date: string;
  cadence: "daily" | "weekly_n";
  target_per_week?: number;
  linked_boss?: string;
  xp_per_unit: number;
  archived: boolean;
  created_at: string;
};

export type EffortLog = {
  id: string;
  effort_id: string;
  date: string;
  completed_at: string;
  note?: string;
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

export type DailyJournal = {
  id: string;
  date: string;
  done_today: string;
  focus_tomorrow: string;
  state: string;
  insights: string;
  reflection: string;
  created_at: string;
};

export type Insight = {
  id: string;
  date: string;
  text: string;
  source?: "voice" | "text";
  created_at: string;
};

export type HabitFrequency = "daily" | "weekly_n" | "custom_days";

export type Habit = {
  id: string;
  name: string;
  icon: string;
  description: string;
  frequency: HabitFrequency;
  target_per_week: number;
  days_of_week?: number[];
  xp_per_completion: number; // deprecated, kept for data compat
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
  frozen?: boolean;
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
