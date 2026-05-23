# OPERATOR — Personal life-plan tracker

Персональный MVP для трекинга 12-месячного плана «К свободе через систему».
Локальный, без бэкенда, все данные в `localStorage`.

## Стек

- Next.js 14 (App Router) + TypeScript (strict)
- Tailwind CSS + shadcn-style UI на Radix
- Zustand (persist → localStorage)
- Recharts, date-fns, lucide-react

## Запуск

```bash
npm install
npm run dev
```

Открыть [http://localhost:3000](http://localhost:3000). Редирект на `/dashboard`.

## Структура

```
app/
  dashboard/page.tsx   — KGI, график веса, дедлайны, mini-stats
  tasks/page.tsx       — задачи по шагам, фильтры, добавление
  review/page.tsx      — weekly review + история + метрики
  layout.tsx           — sidebar + шрифты
components/            — KGICard, WeightChart, DeadlinesList, TaskItem, StepAccordion, ReviewForm, ReviewHistory, Sidebar
  ui/                  — Card, Button, Input, Dialog, Accordion, Badge, Progress, Checkbox, Select, Label
lib/
  types.ts             — модель данных
  initial-data.ts      — KGI, Steps, Tasks, weight targets
  store.ts             — Zustand store с persist
  utils.ts             — даты, прогресс, классы
```

## Сброс данных

В DevTools: `localStorage.removeItem('operator-store-v1')` и перезагрузка.
