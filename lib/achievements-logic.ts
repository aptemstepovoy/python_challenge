import type {
  AchievementId,
  Habit,
  HabitLog,
  Task,
  WeeklyReview,
  KGI,
} from "./types";
import { habitStreak, perfectDaysStreak } from "./habits-logic";
import type { BossState } from "./bosses-logic";
import { levelFromXP } from "./xp";

export type AchievementCategory =
  | "старт"
  | "уровни"
  | "стрики"
  | "привычки"
  | "задачи"
  | "тело"
  | "карьера"
  | "продукт"
  | "боссы"
  | "ревью";

export type AchievementDef = {
  id: AchievementId;
  name: string;
  description: string;
  reward_xp: number;
  real_reward: string;
  category: AchievementCategory;
};

export const ACHIEVEMENTS: AchievementDef[] = [
  // Старт
  {
    id: "first_task",
    name: "Первый шаг",
    description: "Закрыть первую задачу плана",
    reward_xp: 25,
    real_reward: "Любимый кофе сегодня — за счёт себя-будущего",
    category: "старт",
  },
  {
    id: "first_habit",
    name: "Первая искра",
    description: "Залогать первую привычку",
    reward_xp: 25,
    real_reward: "Послушать любимый альбом без отвлечений",
    category: "старт",
  },
  {
    id: "first_review",
    name: "Зеркало недели",
    description: "Сделать первое weekly review",
    reward_xp: 50,
    real_reward: "Час одиночества с книгой или прогулка без телефона",
    category: "старт",
  },

  // Уровни
  {
    id: "level_2",
    name: "Ученик",
    description: "Достичь уровня 2",
    reward_xp: 25,
    real_reward: "Любимый напиток после работы",
    category: "уровни",
  },
  {
    id: "level_3",
    name: "Послушник",
    description: "Достичь уровня 3",
    reward_xp: 50,
    real_reward: "Заказать ужин в любимом месте",
    category: "уровни",
  },
  {
    id: "level_4",
    name: "Соискатель",
    description: "Достичь уровня 4",
    reward_xp: 100,
    real_reward: "Купить книгу или мини-курс",
    category: "уровни",
  },
  {
    id: "level_5",
    name: "Оператор",
    description: "Достичь уровня 5",
    reward_xp: 200,
    real_reward: "Выходной weekend с поездкой за город",
    category: "уровни",
  },
  {
    id: "level_10",
    name: "Тактик",
    description: "Достичь уровня 10",
    reward_xp: 500,
    real_reward: "Качественная вещь, о которой давно думаешь",
    category: "уровни",
  },
  {
    id: "level_15",
    name: "Лидер",
    description: "Достичь уровня 15",
    reward_xp: 1000,
    real_reward: "Короткая поездка / уикенд в другой город",
    category: "уровни",
  },
  {
    id: "level_20",
    name: "Свободный",
    description: "Достичь уровня 20 — финальный титул",
    reward_xp: 2000,
    real_reward: "Большая мечта — то, на что копил весь год",
    category: "уровни",
  },

  // Стрики
  {
    id: "steel_7",
    name: "Неделя стали",
    description: "7 дней streak любой daily-привычки",
    reward_xp: 50,
    real_reward: "Хороший подкаст и тихий вечер",
    category: "стрики",
  },
  {
    id: "steel_30",
    name: "Стальной характер",
    description: "30 дней streak любой daily-привычки",
    reward_xp: 200,
    real_reward: "Новая одежда или гаджет до 5000₽",
    category: "стрики",
  },
  {
    id: "steel_60",
    name: "Два месяца железа",
    description: "60 дней streak любой daily-привычки",
    reward_xp: 350,
    real_reward: "Спа-день или массаж 90+ минут",
    category: "стрики",
  },
  {
    id: "steel_180",
    name: "Полгода без срыва",
    description: "180 дней streak любой daily-привычки",
    reward_xp: 800,
    real_reward: "Короткое путешествие на 2-3 ночи",
    category: "стрики",
  },
  {
    id: "steel_365",
    name: "Год без срыва",
    description: "365 дней streak любой daily-привычки",
    reward_xp: 2000,
    real_reward: "Любая вещь до 50 000₽ без вины",
    category: "стрики",
  },

  // Идеальные дни
  {
    id: "perfect_day",
    name: "Идеальный день",
    description: "Все daily-привычки за один день",
    reward_xp: 50,
    real_reward: "30 минут чистого ничегонеделания без вины",
    category: "привычки",
  },
  {
    id: "perfect_week",
    name: "Идеальная неделя",
    description: "7 идеальных дней подряд",
    reward_xp: 300,
    real_reward: "Выходной без задач — кино, баня или прогулка",
    category: "привычки",
  },
  {
    id: "perfect_month",
    name: "Идеальный месяц",
    description: "30 идеальных дней подряд",
    reward_xp: 1200,
    real_reward: "Гаджет/опыт до 30 000₽ — заработал",
    category: "привычки",
  },
  {
    id: "marathon_30",
    name: "Марафонец",
    description: "30 дней подряд логать хотя бы 1 привычку",
    reward_xp: 100,
    real_reward: "Новые кроссовки или беспроводные наушники",
    category: "привычки",
  },

  // Привычки специфичные
  {
    id: "content_100",
    name: "Контент-машина",
    description: "100 дней streak привычки «Контент»",
    reward_xp: 500,
    real_reward: "Хорошая камера/микрофон до 30 000₽",
    category: "привычки",
  },
  {
    id: "polyglot_100h",
    name: "Полиглот",
    description: "100 часов английского суммарно",
    reward_xp: 300,
    real_reward: "Месяц с tutor-носителем для разгона B2",
    category: "привычки",
  },
  {
    id: "english_b2",
    name: "B2 в кармане",
    description: "Английский — уровень B2+",
    reward_xp: 500,
    real_reward: "Сертификат IELTS / TOEFL для CV",
    category: "привычки",
  },
  {
    id: "athlete_50",
    name: "Атлет",
    description: "50 тренировок выполнено",
    reward_xp: 300,
    real_reward: "Спортивная экипировка или массаж",
    category: "тело",
  },
  {
    id: "clean_week_sugar",
    name: "Чистая неделя",
    description: "7 дней подряд без сахара",
    reward_xp: 100,
    real_reward: "Качественная плитка тёмного шоколада 85%+",
    category: "тело",
  },
  {
    id: "clean_month_sugar",
    name: "Чистый месяц",
    description: "30 дней подряд без сахара",
    reward_xp: 400,
    real_reward: "Купить сезонные ягоды/орехи на 2 недели",
    category: "тело",
  },

  // Задачи
  {
    id: "tasks_10",
    name: "Разогрев",
    description: "10 задач закрыто",
    reward_xp: 50,
    real_reward: "Вкусный завтрак вне дома",
    category: "задачи",
  },
  {
    id: "tasks_50",
    name: "Рабочая лошадка",
    description: "50 задач закрыто",
    reward_xp: 200,
    real_reward: "Новая клавиатура / мышь / стол",
    category: "задачи",
  },
  {
    id: "tasks_100",
    name: "Машина исполнения",
    description: "100 задач закрыто",
    reward_xp: 500,
    real_reward: "Что-то крупное по апгрейду рабочего места",
    category: "задачи",
  },

  // Тело
  {
    id: "weight_minus_5",
    name: "Минус пять",
    description: "Скинул 5 кг от старта",
    reward_xp: 200,
    real_reward: "Новые джинсы / футболка под новый размер",
    category: "тело",
  },
  {
    id: "weight_minus_10",
    name: "Минус десять",
    description: "Скинул 10 кг от старта",
    reward_xp: 400,
    real_reward: "Полный летний обновлённый гардероб",
    category: "тело",
  },
  {
    id: "weight_target",
    name: "Цель веса",
    description: "Добрался до целевого 92 кг",
    reward_xp: 800,
    real_reward: "Фотосессия в новой форме",
    category: "тело",
  },

  // Карьера
  {
    id: "income_6k",
    name: "Шесть тысяч",
    description: "Доход $6000+/мес",
    reward_xp: 400,
    real_reward: "Семейный ужин в дорогом месте",
    category: "карьера",
  },
  {
    id: "income_8k",
    name: "Восемь тысяч",
    description: "Доход $8000+/мес",
    reward_xp: 800,
    real_reward: "Качественные часы или украшение",
    category: "карьера",
  },
  {
    id: "outreach_master",
    name: "Outreach-мастер",
    description: "Закрыт босс «Найм»",
    reward_xp: 400,
    real_reward: "Праздничный ужин с семьёй / партнёром",
    category: "карьера",
  },

  // Продукт
  {
    id: "subscribers_500",
    name: "Первые 500",
    description: "Подписчиков в TG ≥ 500",
    reward_xp: 200,
    real_reward: "Хороший вечер с друзьями",
    category: "продукт",
  },
  {
    id: "subscribers_3000",
    name: "Тысячи",
    description: "Подписчиков в TG ≥ 3000",
    reward_xp: 600,
    real_reward: "Поездка на конференцию по теме блога",
    category: "продукт",
  },

  // Боссы
  {
    id: "boss_naym",
    name: "Победитель Найма",
    description: "Босс «Найм» побеждён",
    reward_xp: 500,
    real_reward: "Новый ноутбук / монитор / рабочее кресло",
    category: "боссы",
  },
  {
    id: "boss_telo",
    name: "Хозяин тела",
    description: "Босс «Тело» побеждён",
    reward_xp: 600,
    real_reward: "Полный гардероб обновить под новый размер",
    category: "боссы",
  },
  {
    id: "boss_bali",
    name: "Бали-резидент",
    description: "Босс «Бали» побеждён",
    reward_xp: 700,
    real_reward: "Первая неделя на Бали — без планов, только адаптация",
    category: "боссы",
  },
  {
    id: "boss_product",
    name: "Создатель",
    description: "Босс «Продукт» побеждён",
    reward_xp: 1000,
    real_reward: "Длинное путешествие с семьёй на 2+ недели",
    category: "боссы",
  },

  // Сундуки и квесты
  {
    id: "chest_streak_7",
    name: "Неделя удачи",
    description: "Открывать дневной сундук 7 дней подряд",
    reward_xp: 200,
    real_reward: "Бутылка хорошего вина / десерт",
    category: "стрики",
  },
  {
    id: "chest_streak_30",
    name: "Месяц удачи",
    description: "Открывать дневной сундук 30 дней подряд",
    reward_xp: 700,
    real_reward: "То, что давно хотел купить «просто так»",
    category: "стрики",
  },
  {
    id: "golden_ticket",
    name: "Золотой билет",
    description: "Выпасть легендарной награды из сундука",
    reward_xp: 500,
    real_reward: "Лотерейный билет в реальной жизни",
    category: "старт",
  },
  {
    id: "quest_master",
    name: "Мастер квестов",
    description: "Выполнить все 3 дневных квеста",
    reward_xp: 50,
    real_reward: "Любимая еда без вины",
    category: "задачи",
  },
  {
    id: "frozen_saved",
    name: "Заморозка спасла",
    description: "Сохранить streak с помощью freeze-токена",
    reward_xp: 100,
    real_reward: "Час чистого ничегонеделания",
    category: "стрики",
  },

  // Ревью
  {
    id: "reviews_4",
    name: "Месяц рефлексии",
    description: "4 weekly review подряд",
    reward_xp: 150,
    real_reward: "Новый дневник или планер на бумаге",
    category: "ревью",
  },
  {
    id: "reviews_12",
    name: "Квартал зеркал",
    description: "12 weekly review всего",
    reward_xp: 400,
    real_reward: "Sober выходной + долгий завтрак",
    category: "ревью",
  },

  // Focus / ritual / inbox
  {
    id: "clean_inbox",
    name: "Чистый Inbox",
    description: "Разобрать весь Inbox",
    reward_xp: 80,
    real_reward: "30 минут тишины",
    category: "задачи",
  },
  {
    id: "committed_3_days",
    name: "Слово держу",
    description: "3 дня подряд закрывал committed-задачи",
    reward_xp: 150,
    real_reward: "Любимый ужин",
    category: "стрики",
  },
  {
    id: "recovery_done",
    name: "Вернулся",
    description: "Вернулся в работу после пропущенного дня",
    reward_xp: 50,
    real_reward: "Час без вины",
    category: "старт",
  },
  {
    id: "planned_week",
    name: "Архитектор недели",
    description: "7 дней подряд начинал день с утреннего ритуала",
    reward_xp: 200,
    real_reward: "Хороший планер на бумаге",
    category: "ревью",
  },
];

export type CheckInput = {
  xp: number;
  tasks: Task[];
  habits: Habit[];
  habitLogs: HabitLog[];
  reviews: WeeklyReview[];
  kgis: KGI[];
  bossStates: BossState[];
  chestStreak?: number;
  chestHistory?: Array<{ tier: string; xp: number; date: string }>;
  dailyQuests?: Array<{ date: string; rewarded: boolean }>;
  streakFreezesEarned?: number;
  dailyPlans?: Array<{
    date: string;
    committed_task_ids: string[];
    finalized_at?: string;
  }>;
};

export function checkAchievements(input: CheckInput): AchievementId[] {
  const unlocked: AchievementId[] = [];
  const doneCount = input.tasks.filter((t) => t.status === "done").length;

  if (doneCount >= 1) unlocked.push("first_task");
  if (doneCount >= 10) unlocked.push("tasks_10");
  if (doneCount >= 50) unlocked.push("tasks_50");
  if (doneCount >= 100) unlocked.push("tasks_100");

  if (input.habitLogs.length >= 1) unlocked.push("first_habit");
  if (input.reviews.length >= 1) unlocked.push("first_review");
  if (input.reviews.length >= 4) unlocked.push("reviews_4");
  if (input.reviews.length >= 12) unlocked.push("reviews_12");

  const lvlNum = levelFromXP(input.xp).num;
  if (lvlNum >= 2) unlocked.push("level_2");
  if (lvlNum >= 3) unlocked.push("level_3");
  if (lvlNum >= 4) unlocked.push("level_4");
  if (lvlNum >= 5) unlocked.push("level_5");
  if (lvlNum >= 10) unlocked.push("level_10");
  if (lvlNum >= 15) unlocked.push("level_15");
  if (lvlNum >= 20) unlocked.push("level_20");

  const perfectStreak = perfectDaysStreak(input.habits, input.habitLogs);
  if (perfectStreak >= 1) unlocked.push("perfect_day");
  if (perfectStreak >= 7) unlocked.push("perfect_week");
  if (perfectStreak >= 30) unlocked.push("perfect_month");

  const dailyHabits = input.habits.filter(
    (h) => h.frequency === "daily" && !h.archived
  );
  const maxStreak = Math.max(
    0,
    ...dailyHabits.map((h) => habitStreak(input.habitLogs, h.id))
  );
  if (maxStreak >= 7) unlocked.push("steel_7");
  if (maxStreak >= 30) unlocked.push("steel_30");
  if (maxStreak >= 60) unlocked.push("steel_60");
  if (maxStreak >= 180) unlocked.push("steel_180");
  if (maxStreak >= 365) unlocked.push("steel_365");

  const datesWithAnyLog = new Set(input.habitLogs.map((l) => l.date));
  if (datesWithAnyLog.size >= 30) unlocked.push("marathon_30");

  const content = input.habits.find((h) => h.name === "Контент");
  if (content && habitStreak(input.habitLogs, content.id) >= 100) {
    unlocked.push("content_100");
  }

  const englishHrs = input.reviews
    .map((r) => r.english_hours ?? 0)
    .reduce((a, b) => a + b, 0);
  if (englishHrs >= 100) unlocked.push("polyglot_100h");

  const english = input.kgis.find((k) => k.id === "english");
  if (
    english &&
    typeof english.current_value === "string" &&
    /B2/i.test(english.current_value)
  ) {
    unlocked.push("english_b2");
  }

  const workout = input.habits.find((h) => h.name === "Тренировка");
  if (
    workout &&
    input.habitLogs.filter((l) => l.habit_id === workout.id).length >= 50
  ) {
    unlocked.push("athlete_50");
  }

  const sugar = input.habits.find((h) => h.name === "Без сахара");
  if (sugar) {
    const s = habitStreak(input.habitLogs, sugar.id);
    if (s >= 7) unlocked.push("clean_week_sugar");
    if (s >= 30) unlocked.push("clean_month_sugar");
  }

  const weight = input.kgis.find((k) => k.id === "weight");
  if (weight) {
    const start = Number(weight.start_value);
    const cur = Number(weight.current_value);
    if (start - cur >= 5) unlocked.push("weight_minus_5");
    if (start - cur >= 10) unlocked.push("weight_minus_10");
    if (cur <= 92) unlocked.push("weight_target");
  }

  const income = input.kgis.find((k) => k.id === "income");
  if (income) {
    const cur = Number(income.current_value);
    if (cur >= 6000) unlocked.push("income_6k");
    if (cur >= 8000) unlocked.push("income_8k");
  }

  const subs = input.kgis.find((k) => k.id === "subscribers");
  if (subs) {
    const cur = Number(subs.current_value);
    if (cur >= 500) unlocked.push("subscribers_500");
    if (cur >= 3000) unlocked.push("subscribers_3000");
  }

  for (const bs of input.bossStates) {
    if (!bs.defeated) continue;
    const id = `boss_${bs.boss.id}` as AchievementId;
    unlocked.push(id);
    if (bs.boss.id === "naym") unlocked.push("outreach_master");
  }

  // Сундуки и квесты
  if ((input.chestStreak ?? 0) >= 7) unlocked.push("chest_streak_7");
  if ((input.chestStreak ?? 0) >= 30) unlocked.push("chest_streak_30");
  if (input.chestHistory?.some((c) => c.tier === "legendary")) {
    unlocked.push("golden_ticket");
  }
  if (input.dailyQuests?.some((q) => q.rewarded)) {
    unlocked.push("quest_master");
  }
  if ((input.streakFreezesEarned ?? 0) >= 1) unlocked.push("frozen_saved");

  // v7 — ритуал, focus, inbox
  const hadInbox = input.tasks.some((t) => t.status === "inbox");
  const totalTasksTouched = input.tasks.length > 0;
  if (totalTasksTouched && !hadInbox && doneCount > 0) {
    unlocked.push("clean_inbox");
  }

  const plans = input.dailyPlans ?? [];
  if (plans.length > 0) {
    // committed_3_days: 3 последних дня подряд, у каждого ≥1 закрытая committed-задача
    const sorted = [...plans].sort((a, b) => b.date.localeCompare(a.date));
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    for (let i = 0; i < sorted.length; i++) {
      const expected = new Date(today);
      expected.setDate(expected.getDate() - i);
      const expectedISO = expected.toISOString().slice(0, 10);
      const p = sorted[i];
      if (p.date !== expectedISO) break;
      const hasClosed = p.committed_task_ids.some((id) => {
        const t = input.tasks.find((x) => x.id === id);
        return (
          t &&
          t.status === "done" &&
          t.completed_at &&
          t.completed_at.startsWith(p.date)
        );
      });
      if (!hasClosed) break;
      streak += 1;
    }
    if (streak >= 3) unlocked.push("committed_3_days");

    // planned_week: 7 dailyPlans подряд (просто наличие записи)
    let plannedStreak = 0;
    for (let i = 0; i < sorted.length; i++) {
      const expected = new Date(today);
      expected.setDate(expected.getDate() - i);
      const expectedISO = expected.toISOString().slice(0, 10);
      if (sorted[i].date !== expectedISO) break;
      plannedStreak += 1;
    }
    if (plannedStreak >= 7) unlocked.push("planned_week");

    // recovery_done: есть план сегодня + был день без активности до этого
    const todayISO = today.toISOString().slice(0, 10);
    const hasTodayPlan = plans.some((p) => p.date === todayISO);
    if (hasTodayPlan) {
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const yISO = yesterday.toISOString().slice(0, 10);
      const yPlan = plans.find((p) => p.date === yISO);
      const yClosed = input.tasks.some(
        (t) => t.completed_at && t.completed_at.startsWith(yISO)
      );
      if (yPlan && !yClosed) unlocked.push("recovery_done");
    }
  }

  return Array.from(new Set(unlocked));
}
