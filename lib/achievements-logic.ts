import type {
  AchievementId,
  Habit,
  HabitLog,
  Task,
  WeeklyReview,
} from "./types";
import { habitStreak, perfectDaysStreak } from "./habits-logic";
import type { BossState } from "./bosses-logic";

export type AchievementDef = {
  id: AchievementId;
  name: string;
  description: string;
  reward_xp: number;
  real_reward: string;
};

export const ACHIEVEMENTS: AchievementDef[] = [
  {
    id: "first_task",
    name: "Первый шаг",
    description: "Закрыть первую задачу плана",
    reward_xp: 25,
    real_reward: "Любимый кофе сегодня — за счёт себя-будущего",
  },
  {
    id: "level_2",
    name: "Оператор",
    description: "Достичь уровня 2 (500 XP)",
    reward_xp: 100,
    real_reward: "Заказать ужин в любимом месте",
  },
  {
    id: "level_3",
    name: "Архитектор",
    description: "Достичь уровня 3 (1500 XP)",
    reward_xp: 200,
    real_reward: "Купить книгу или мини-курс, который давно хотел",
  },
  {
    id: "perfect_day",
    name: "Идеальный день",
    description: "Все daily-привычки за один день",
    reward_xp: 50,
    real_reward: "30 минут чистого ничегонеделания без вины",
  },
  {
    id: "perfect_week",
    name: "Идеальная неделя",
    description: "7 идеальных дней подряд",
    reward_xp: 300,
    real_reward: "Выходной без задач — кино, баня или прогулка",
  },
  {
    id: "steel_30",
    name: "Стальной характер",
    description: "30 дней streak любой daily-привычки",
    reward_xp: 200,
    real_reward: "Новая одежда или гаджет до 5000₽",
  },
  {
    id: "content_100",
    name: "Контент-машина",
    description: "100 дней streak привычки «Контент»",
    reward_xp: 500,
    real_reward: "Хорошая камера/микрофон до 30 000₽",
  },
  {
    id: "polyglot_100h",
    name: "Полиглот",
    description: "100 часов английского суммарно",
    reward_xp: 300,
    real_reward: "Месяц с tutor-носителем для разгона B2",
  },
  {
    id: "athlete_50",
    name: "Атлет",
    description: "50 тренировок выполнено",
    reward_xp: 300,
    real_reward: "Спортивная экипировка или массаж",
  },
  {
    id: "outreach_master",
    name: "Outreach-мастер",
    description: "Закрыт босс «Найм»",
    reward_xp: 400,
    real_reward: "Праздничный ужин с семьёй / партнёром",
  },
  {
    id: "clean_week_sugar",
    name: "Чистая неделя",
    description: "7 дней подряд без сахара",
    reward_xp: 100,
    real_reward: "Качественная плитка тёмного шоколада 85%+",
  },
  {
    id: "boss_naym",
    name: "Победитель Найма",
    description: "Босс «Найм» побеждён",
    reward_xp: 0,
    real_reward: "Новый ноутбук / монитор / рабочее кресло",
  },
  {
    id: "boss_telo",
    name: "Хозяин тела",
    description: "Босс «Тело» побеждён",
    reward_xp: 0,
    real_reward: "Полный гардероб обновить под новый размер",
  },
  {
    id: "boss_bali",
    name: "Бали-резидент",
    description: "Босс «Бали» побеждён",
    reward_xp: 0,
    real_reward: "Первая неделя на Бали — без планов, только адаптация",
  },
  {
    id: "boss_product",
    name: "Создатель",
    description: "Босс «Продукт» побеждён",
    reward_xp: 0,
    real_reward: "Длинное путешествие с семьёй на 2+ недели",
  },
];

export type CheckInput = {
  xp: number;
  tasks: Task[];
  habits: Habit[];
  habitLogs: HabitLog[];
  reviews: WeeklyReview[];
  bossStates: BossState[];
};

export function checkAchievements(input: CheckInput): AchievementId[] {
  const unlocked: AchievementId[] = [];
  const doneCount = input.tasks.filter((t) => t.status === "done").length;
  if (doneCount >= 1) unlocked.push("first_task");
  if (input.xp >= 500) unlocked.push("level_2");
  if (input.xp >= 1500) unlocked.push("level_3");

  if (
    input.habits
      .filter((h) => h.frequency === "daily" && !h.archived)
      .some((h) => habitStreak(input.habitLogs, h.id) >= 1) &&
    perfectDaysStreak(input.habits, input.habitLogs) >= 1
  ) {
    unlocked.push("perfect_day");
  }
  if (perfectDaysStreak(input.habits, input.habitLogs) >= 7) {
    unlocked.push("perfect_week");
  }

  const maxStreak = Math.max(
    0,
    ...input.habits
      .filter((h) => h.frequency === "daily")
      .map((h) => habitStreak(input.habitLogs, h.id))
  );
  if (maxStreak >= 30) unlocked.push("steel_30");

  const content = input.habits.find((h) => h.name === "Контент");
  if (content && habitStreak(input.habitLogs, content.id) >= 100) {
    unlocked.push("content_100");
  }

  const englishHrs = input.reviews
    .map((r) => r.english_hours ?? 0)
    .reduce((a, b) => a + b, 0);
  if (englishHrs >= 100) unlocked.push("polyglot_100h");

  const workout = input.habits.find((h) => h.name === "Тренировка");
  if (
    workout &&
    input.habitLogs.filter((l) => l.habit_id === workout.id).length >= 50
  ) {
    unlocked.push("athlete_50");
  }

  const sugar = input.habits.find((h) => h.name === "Без сахара");
  if (sugar && habitStreak(input.habitLogs, sugar.id) >= 7) {
    unlocked.push("clean_week_sugar");
  }

  for (const bs of input.bossStates) {
    if (!bs.defeated) continue;
    const id = `boss_${bs.boss.id}` as AchievementId;
    unlocked.push(id);
    if (bs.boss.id === "naym") unlocked.push("outreach_master");
  }

  return Array.from(new Set(unlocked));
}
