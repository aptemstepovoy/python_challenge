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
