import type { Boss, Habit, KGI, Step, Task, WeightTarget } from "./types";

export const initialKGIs: KGI[] = [
  {
    id: "income",
    name: "Доход",
    unit: "$/мес",
    start_value: 2200,
    current_value: 2200,
    target_nov_2026: 6000,
    target_may_2027: 8000,
    higher_is_better: true,
  },
  {
    id: "weight",
    name: "Вес",
    unit: "кг",
    start_value: 110,
    current_value: 110,
    target_nov_2026: 101,
    target_may_2027: 92,
    higher_is_better: false,
  },
  {
    id: "location",
    name: "Локация",
    unit: "",
    start_value: "Краснодар",
    current_value: "Краснодар",
    target_nov_2026: "Бали",
    target_may_2027: "Бали",
  },
  {
    id: "english",
    name: "Английский",
    unit: "уровень",
    start_value: "B1+",
    current_value: "B1+",
    target_nov_2026: "B1+/B2",
    target_may_2027: "B2+",
  },
  {
    id: "subscribers",
    name: "Подписчики TG",
    unit: "чел",
    start_value: 0,
    current_value: 0,
    target_nov_2026: 500,
    target_may_2027: 3000,
    higher_is_better: true,
  },
  {
    id: "clients",
    name: "Платящих клиентов",
    unit: "чел",
    start_value: 0,
    current_value: 0,
    target_nov_2026: 0,
    target_may_2027: 3,
    higher_is_better: true,
  },
];

export const initialSteps: Step[] = [
  {
    id: "S1",
    parent_id: null,
    title: "Смена найма",
    start_date: "2026-05-25",
    deadline: "2026-07-23",
    description: "Переход на новое место работы с лучшими условиями",
  },
  {
    id: "S1.1",
    parent_id: "S1",
    title: "Блог",
    start_date: "2026-05-25",
    deadline: "2026-11-23",
    description: "Запуск и ведение публичного блога",
  },
  {
    id: "S1.2",
    parent_id: "S1",
    title: "Фриланс план Б",
    start_date: "2026-07-23",
    deadline: "2026-11-23",
    description: "Активируется при срабатывании триггера 2026-07-23",
  },
  {
    id: "S2",
    parent_id: null,
    title: "Продажа авто",
    start_date: "2026-05-25",
    deadline: "2026-07-23",
  },
  {
    id: "S2.1",
    parent_id: "S2",
    title: "Ремонт квартиры",
    start_date: "2026-05-25",
    deadline: "2026-07-23",
  },
  {
    id: "S3",
    parent_id: null,
    title: "Переезд на Бали",
    start_date: "2026-06-01",
    deadline: "2026-11-23",
  },
  {
    id: "S4",
    parent_id: null,
    title: "Валидация продукта",
    start_date: "2026-12-01",
    deadline: "2027-05-23",
  },
  {
    id: "S5",
    parent_id: null,
    title: "Выход из найма",
    start_date: "2027-05-23",
    deadline: "2027-05-23",
    description: "Условный шаг, активируется после S4",
  },
];

const todo = (
  id: string,
  step_id: string,
  title: string,
  start_date: string,
  deadline: string,
  result_definition = ""
): Task => ({
  id,
  step_id,
  title,
  start_date,
  deadline,
  status: "todo",
  result_definition,
});

export const initialTasks: Task[] = [
  // S1 — Смена найма
  todo("S1.1", "S1", "CV обновить", "2026-05-25", "2026-05-30", "Резюме готово в 2 форматах (RU/EN), выложено на 5 площадках"),
  todo("S1.2", "S1", "Профили на 5 площадках", "2026-05-25", "2026-06-01", "Заполнены HH, LinkedIn, Habr, Indeed, AngelList"),
  todo("S1.3", "S1", "Решение по LinkedIn", "2026-05-25", "2026-06-03", "Принято решение: использовать / не использовать"),
  todo("S1.4", "S1", "3 шаблона outbound", "2026-05-25", "2026-06-04", "Готовы 3 шаблона: cold, warm, referral"),
  todo("S1.5", "S1", "30 target-компаний", "2026-05-25", "2026-06-07", "Список из 30 компаний с приоритетами"),
  todo("S1.6", "S1", "Активный outbound 5/нед + apps 5/нед", "2026-06-08", "2026-07-23", "Стабильный поток откликов и инициатив"),
  todo("S1.7", "S1", "Интервью 3+ финальных", "2026-06-15", "2026-07-23", "Дошёл до финала минимум в 3 компаниях"),
  todo("S1.8", "S1", "Подписать оффер", "2026-07-01", "2026-07-23", "Оффер на руках, дата выхода согласована"),

  // S1.1 — Блог
  todo("S1.1.A", "S1.1", "Название канала", "2026-05-25", "2026-05-27", "Название утверждено, проверена доступность"),
  todo("S1.1.B", "S1.1", "Создать TG + X", "2026-05-25", "2026-05-28", "Каналы созданы, оформлены"),
  todo("S1.1.C", "S1.1", "Сетап видео", "2026-05-25", "2026-05-30", "Свет, звук, фон, тестовая запись"),
  todo("S1.1.D", "S1.1", "Manifest-пост", "2026-05-25", "2026-05-29", "Опубликован пост-манифест"),
  todo("S1.1.E", "S1.1", "Контент-план 30 тем", "2026-05-25", "2026-05-31", "Готов список из 30 тем"),
  todo("S1.1.F", "S1.1", "Регулярный постинг — июнь", "2026-06-01", "2026-06-30", "≥3 поста в неделю"),
  todo("S1.1.G", "S1.1", "Регулярный постинг — июль", "2026-07-01", "2026-07-31", "≥3 поста в неделю"),
  todo("S1.1.H", "S1.1", "Регулярный постинг — август", "2026-08-01", "2026-08-31", "≥3 поста в неделю"),
  todo("S1.1.I", "S1.1", "Регулярный постинг — сентябрь+", "2026-09-01", "2026-11-23", "≥3 поста в неделю"),

  // S1.2 — Фриланс план Б
  todo("S1.2.1", "S1.2", "Профили на фриланс-биржах", "2026-07-23", "2026-08-01", "Upwork, Toptal, Habr Freelance"),
  todo("S1.2.2", "S1.2", "Портфолио кейсов", "2026-07-23", "2026-08-10", "3-5 кейсов с описанием результатов"),
  todo("S1.2.3", "S1.2", "Первый платящий клиент", "2026-08-01", "2026-09-30", "Подписан договор, получена оплата"),

  // S2 — Продажа авто
  todo("S2.1", "S2", "Цена рынка", "2026-05-25", "2026-05-28", "Изучен рынок, определён ценовой диапазон"),
  todo("S2.2", "S2", "Остаток по кредиту", "2026-05-25", "2026-05-28", "Точная сумма остатка от банка"),
  todo("S2.3", "S2", "Предпродажная подготовка", "2026-05-28", "2026-06-04", "Мойка, химчистка, мелкий ремонт"),
  todo("S2.4", "S2", "Фотосессия", "2026-06-04", "2026-06-05", "20+ качественных фото"),
  todo("S2.5", "S2", "Выставление 3 площадки", "2026-06-05", "2026-06-06", "Avito, Auto.ru, Drom"),
  todo("S2.6", "S2", "Показы", "2026-06-07", "2026-07-16", "Регулярные просмотры покупателями"),
  todo("S2.7", "S2", "Сделка + закрыть кредит", "2026-07-01", "2026-07-23", "Сделка проведена, кредит закрыт"),

  // S2.1 — Ремонт квартиры
  todo("S2.1.1", "S2.1", "Выбор краски", "2026-05-25", "2026-05-30", "Выбран цвет, тип, бренд"),
  todo("S2.1.2", "S2.1", "Закупка материалов", "2026-05-30", "2026-06-06", "Куплены краска, валики, плёнка, грунт"),
  todo("S2.1.3", "S2.1", "Содрать обои", "2026-06-06", "2026-06-20", "Все обои сняты, стены очищены"),
  todo("S2.1.4", "S2.1", "Подготовка стен", "2026-06-20", "2026-06-27", "Стены прогрунтованы, выровнены"),
  todo("S2.1.5", "S2.1", "Покраска", "2026-06-27", "2026-07-11", "Все стены окрашены в 2 слоя"),
  todo("S2.1.6", "S2.1", "Замеры шкафов", "2026-05-25", "2026-05-30", "Все размеры зафиксированы"),
  todo("S2.1.7", "S2.1", "Выбор шкафов", "2026-05-30", "2026-06-13", "Утверждён производитель и модель"),
  todo("S2.1.8", "S2.1", "Заказ шкафов", "2026-06-13", "2026-06-20", "Оплачен заказ"),
  todo("S2.1.9", "S2.1", "Сборка шкафов", "2026-07-10", "2026-07-18", "Шкафы собраны и установлены"),

  // S3 — Переезд на Бали
  todo("S3.1", "S3", "Открыть валютный счёт", "2026-06-01", "2026-06-30", "Счёт открыт, тестовый перевод сделан"),
  todo("S3.2", "S3", "Виза — подготовка документов", "2026-07-01", "2026-11-01", "Виза получена / готова к получению"),
  todo("S3.3", "S3", "Выбор школы", "2026-07-01", "2026-10-01", "Школа выбрана, контакт установлен"),
  todo("S3.4", "S3", "Бронь школы", "2026-10-01", "2026-11-01", "Депозит внесён, место зарезервировано"),
  todo("S3.5", "S3", "Бронь жилья", "2026-09-01", "2026-11-01", "Жильё забронировано минимум на 3 мес"),
  todo("S3.6", "S3", "Билеты", "2026-09-01", "2026-10-15", "Билеты куплены"),
  todo("S3.7", "S3", "Сборы и логистика", "2026-10-15", "2026-11-15", "Вещи упакованы, готовы к перелёту"),

  // S4 — Валидация продукта
  todo("S4.1", "S4", "Сформулировать гипотезы", "2026-12-01", "2026-12-23", "Список из 5+ продуктовых гипотез"),
  todo("S4.2", "S4", "Discovery 15+ интервью", "2026-12-23", "2027-02-28", "Проведено 15+ глубинных интервью"),
  todo("S4.3", "S4", "Выбор гипотезы", "2027-02-28", "2027-03-15", "Выбрана 1 гипотеза для MVP"),
  todo("S4.4", "S4", "MVP", "2027-03-15", "2027-04-30", "Работающий MVP, протестирован"),
  todo("S4.5", "S4", "2-3 платящих клиента", "2027-04-30", "2027-05-23", "Минимум 2 платящих клиента"),

  // S5 — Выход из найма (placeholder)
  todo("S5.1", "S5", "Решение о выходе", "2027-05-23", "2027-05-23", "Принято решение на основе результатов S4"),
].map((t) => {
  const sid = t.step_id;
  let linked_boss: string | undefined;
  let xp = 25;
  if (sid === "S1" || sid === "S1.1" || sid === "S1.2") {
    linked_boss = "naym";
    xp = sid === "S1" ? 50 : 25;
  } else if (sid === "S3") {
    linked_boss = "bali";
    xp = 50;
  } else if (sid === "S4") {
    linked_boss = "product";
    xp = 75;
  }
  return { ...t, xp, linked_boss };
});

export const weightTargets: WeightTarget[] = [
  { date: "2026-05-23", weight_kg: 110 },
  { date: "2026-06-23", weight_kg: 108.5 },
  { date: "2026-07-23", weight_kg: 107 },
  { date: "2026-08-23", weight_kg: 105.5 },
  { date: "2026-09-23", weight_kg: 104 },
  { date: "2026-10-23", weight_kg: 102.5 },
  { date: "2026-11-23", weight_kg: 101 },
  { date: "2026-12-23", weight_kg: 99.5 },
  { date: "2027-01-23", weight_kg: 98 },
  { date: "2027-02-23", weight_kg: 96.5 },
  { date: "2027-03-23", weight_kg: 95 },
  { date: "2027-04-23", weight_kg: 93.5 },
  { date: "2027-05-23", weight_kg: 92 },
];

export const initialHabits: Habit[] = [
  {
    id: "h1",
    name: "Контент",
    icon: "PenLine",
    description: "Один пост или пара заметок в день",
    frequency: "daily",
    target_per_week: 7,
    xp_per_completion: 15,
    linked_kgi: "subscribers",
    linked_boss: "product",
    color: "#d4a574",
    created_at: "2026-05-23",
    archived: false,
  },
  {
    id: "h2",
    name: "Английский",
    icon: "Languages",
    description: "Минимум 30 минут практики",
    frequency: "daily",
    target_per_week: 7,
    xp_per_completion: 15,
    linked_kgi: "english",
    color: "#7cc4d8",
    created_at: "2026-05-23",
    archived: false,
  },
  {
    id: "h3",
    name: "Тренировка",
    icon: "Dumbbell",
    description: "Силовая или функциональная",
    frequency: "weekly_n",
    target_per_week: 3,
    xp_per_completion: 40,
    linked_kgi: "weight",
    linked_boss: "telo",
    color: "#d87c7c",
    created_at: "2026-05-23",
    archived: false,
  },
  {
    id: "h4",
    name: "Взвешивание",
    icon: "Scale",
    description: "Раз в неделю — в одно и то же время",
    frequency: "weekly_n",
    target_per_week: 1,
    xp_per_completion: 50,
    linked_kgi: "weight",
    linked_boss: "telo",
    color: "#5fd97a",
    created_at: "2026-05-23",
    archived: false,
  },
  {
    id: "h5",
    name: "Outreach",
    icon: "Send",
    description: "Сообщения и отклики, 5 в неделю",
    frequency: "weekly_n",
    target_per_week: 5,
    xp_per_completion: 20,
    linked_kgi: "income",
    linked_boss: "naym",
    color: "#9d7cd8",
    created_at: "2026-05-23",
    archived: false,
    active_until: "2026-07-23",
  },
  {
    id: "h6",
    name: "10к шагов",
    icon: "Footprints",
    description: "Часы на ногах",
    frequency: "daily",
    target_per_week: 7,
    xp_per_completion: 10,
    linked_kgi: "weight",
    linked_boss: "telo",
    color: "#5fd97a",
    created_at: "2026-05-23",
    archived: false,
  },
  {
    id: "h7",
    name: "Чтение",
    icon: "BookOpen",
    description: "Минимум 20 минут — книги, доки",
    frequency: "daily",
    target_per_week: 7,
    xp_per_completion: 10,
    color: "#a0a0a0",
    created_at: "2026-05-23",
    archived: false,
  },
  {
    id: "h8",
    name: "Без сахара",
    icon: "Ban",
    description: "День без добавленного сахара",
    frequency: "daily",
    target_per_week: 7,
    xp_per_completion: 15,
    linked_kgi: "weight",
    linked_boss: "telo",
    color: "#d87c7c",
    created_at: "2026-05-23",
    archived: false,
  },
];

export const initialBosses: Boss[] = [
  {
    id: "naym",
    name: "Найм",
    description: "Сменить работу на более доходную",
    total_hp: 400,
    reward_xp: 500,
    start_date: "2026-05-25",
    target_date: "2026-07-23",
    damage_per_habit: 20,
  },
  {
    id: "telo",
    name: "Тело",
    description: "С 110 кг до 92 кг и обратно к форме",
    total_hp: 600,
    reward_xp: 600,
    start_date: "2026-05-23",
    target_date: "2027-05-23",
    damage_per_habit: 15,
  },
  {
    id: "bali",
    name: "Бали",
    description: "Переезд всей семьёй на Бали",
    total_hp: 350,
    reward_xp: 700,
    start_date: "2026-06-01",
    target_date: "2026-11-23",
    damage_per_habit: 0,
  },
  {
    id: "product",
    name: "Продукт",
    description: "От гипотез к 2–3 платящим клиентам",
    total_hp: 375,
    reward_xp: 1000,
    start_date: "2026-12-01",
    target_date: "2027-05-23",
    damage_per_habit: 10,
    unlocks_after: "naym",
  },
];
