import type { Boss, Habit, HabitLog, Task } from "./types";

export type BossState = {
  boss: Boss;
  damage: number;
  hpRemaining: number;
  hpPercent: number;
  defeated: boolean;
  taskDamage: number;
  habitDamage: number;
};

export function computeBossState(
  boss: Boss,
  tasks: Task[],
  habits: Habit[],
  habitLogs: HabitLog[]
): BossState {
  const taskDmg = tasks
    .filter((t) => t.linked_boss === boss.id && t.status === "done")
    .reduce((acc, t) => acc + (t.xp ?? 25), 0);

  const linkedHabitIds = new Set(
    habits.filter((h) => h.linked_boss === boss.id).map((h) => h.id)
  );
  const habitDmg =
    habitLogs.filter((l) => linkedHabitIds.has(l.habit_id)).length *
    boss.damage_per_habit;

  const damage = taskDmg + habitDmg;
  const hpRemaining = Math.max(0, boss.total_hp - damage);
  const hpPercent = boss.total_hp
    ? Math.max(0, Math.min(100, (hpRemaining / boss.total_hp) * 100))
    : 0;
  return {
    boss,
    damage,
    hpRemaining,
    hpPercent,
    defeated: hpRemaining <= 0,
    taskDamage: taskDmg,
    habitDamage: habitDmg,
  };
}

export function nearestBoss(
  states: BossState[],
  today: Date = new Date()
): BossState | null {
  const active = states.filter(
    (s) => !s.defeated && new Date(s.boss.target_date) >= today
  );
  if (active.length === 0) return states.find((s) => !s.defeated) ?? null;
  return active.slice().sort((a, b) =>
    a.boss.target_date.localeCompare(b.boss.target_date)
  )[0];
}
