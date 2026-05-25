"use client";

import { useMemo, useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { StepAccordionList } from "@/components/StepAccordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TaskItem } from "@/components/TaskItem";
import { TaskFormDialog } from "@/components/TaskFormDialog";
import { useStore } from "@/lib/store";
import { cn, formatDateRu } from "@/lib/utils";
import {
  addDays,
  endOfMonth,
  endOfWeek,
  format,
  parseISO,
} from "date-fns";
import { ru } from "date-fns/locale";
import type { Task } from "@/lib/types";
import { Plus, Search, X, Check, Undo2, Inbox } from "lucide-react";

type Tab = "active" | "by_step" | "inbox" | "done";

const TABS: { key: Tab; label: string }[] = [
  { key: "active", label: "Активные" },
  { key: "by_step", label: "По шагам" },
  { key: "inbox", label: "Inbox" },
  { key: "done", label: "Выполненные" },
];

function Bucket({
  id,
  title,
  tone,
  tasks,
  hint,
}: {
  id: string;
  title: string;
  tone: "danger" | "accent" | "warn" | "muted";
  tasks: Task[];
  hint?: string;
}) {
  const toneClass =
    tone === "danger"
      ? "text-danger-bright"
      : tone === "accent"
      ? "text-accent-bright"
      : tone === "warn"
      ? "text-pink-bright"
      : "text-secondary";

  return (
    <AccordionItem value={id}>
      <AccordionTrigger>
        <div className="flex w-full items-center gap-3 pr-3">
          <span
            className={cn(
              "font-mono text-sm uppercase tracking-[0.18em]",
              toneClass
            )}
          >
            ◆ {title}
          </span>
          {hint && (
            <span className="font-mono text-[10px] uppercase tracking-wider text-muted truncate">
              {hint}
            </span>
          )}
          <span className="flex-1" />
          <span className={cn("num text-sm", toneClass)}>{tasks.length}</span>
        </div>
      </AccordionTrigger>
      <AccordionContent>
        {tasks.length === 0 ? (
          <div className="py-3 text-base text-secondary">Задач нет</div>
        ) : (
          <div className="space-y-1">
            {tasks.map((t) => (
              <TaskItem key={t.id} task={t} />
            ))}
          </div>
        )}
      </AccordionContent>
    </AccordionItem>
  );
}

function DoneRow({ task }: { task: Task }) {
  const cycle = useStore((s) => s.cycleTaskStatus);
  const completed = task.completed_at
    ? format(parseISO(task.completed_at), "d MMM · HH:mm", { locale: ru })
    : "—";
  return (
    <div className="flex items-center gap-2.5 rounded-md border border-border bg-surface px-3 py-2 group">
      <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-sm border border-ok-bright bg-ok-bright text-background">
        <Check className="h-3.5 w-3.5" strokeWidth={3} />
      </div>
      <span className="num shrink-0 text-[10px] text-muted">{task.id}</span>
      <span className="flex-1 min-w-0 truncate text-sm text-muted line-through">
        {task.title}
      </span>
      <span className="shrink-0 font-mono text-[10px] uppercase tracking-wider text-secondary">
        {completed}
      </span>
      <span className="shrink-0 num text-[10px] text-accent">
        +{task.xp ?? 25}
      </span>
      <button
        onClick={() => cycle(task.id)}
        className="shrink-0 text-secondary hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity"
        aria-label="Восстановить"
        title="Восстановить"
      >
        <Undo2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

export default function TasksPage() {
  const allTasks = useStore((s) => s.tasks);
  const steps = useStore((s) => s.steps);
  const [tab, setTab] = useState<Tab>("active");
  const [addOpen, setAddOpen] = useState(false);
  const [query, setQuery] = useState("");

  const searchFiltered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return allTasks;
    return allTasks.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.id.toLowerCase().includes(q) ||
        (t.result_definition ?? "").toLowerCase().includes(q)
    );
  }, [allTasks, query]);

  const hasQuery = query.trim().length > 0;

  const buckets = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayISO = today.toISOString().slice(0, 10);
    const weekEnd = endOfWeek(today, { weekStartsOn: 1 });
    const monthEnd = endOfMonth(today);
    const q3End = addDays(today, 90);
    const m6End = addDays(today, 180);
    const yearEnd = addDays(today, 365);

    const open = searchFiltered.filter((t) => t.status !== "done");

    // Просрочено — exclusive (deadline в прошлом)
    const overdue = open
      .filter((t) => t.deadline < todayISO)
      .sort((a, b) => a.deadline.localeCompare(b.deadline));

    // Сегодня — exclusive (deadline ровно сегодня)
    const todayList = open
      .filter((t) => t.deadline === todayISO)
      .sort((a, b) => (b.xp ?? 25) - (a.xp ?? 25));

    // Все остальные секции — inclusive (deadline в диапазоне [today, X],
    // включая сегодня). Тот же task может появиться в неделе И в месяце.
    const inRange = (t: Task, end: Date) => {
      const d = parseISO(t.deadline);
      return d >= today && d <= end;
    };

    const week = open
      .filter((t) => inRange(t, weekEnd))
      .sort((a, b) => a.deadline.localeCompare(b.deadline));

    const month = open
      .filter((t) => inRange(t, monthEnd))
      .sort((a, b) => a.deadline.localeCompare(b.deadline));

    const q3 = open
      .filter((t) => inRange(t, q3End))
      .sort((a, b) => a.deadline.localeCompare(b.deadline));

    const m6 = open
      .filter((t) => inRange(t, m6End))
      .sort((a, b) => a.deadline.localeCompare(b.deadline));

    const year = open
      .filter((t) => inRange(t, yearEnd))
      .sort((a, b) => a.deadline.localeCompare(b.deadline));

    const later = open
      .filter((t) => parseISO(t.deadline) > yearEnd)
      .sort((a, b) => a.deadline.localeCompare(b.deadline));

    return {
      overdue,
      today: todayList,
      week,
      month,
      q3,
      m6,
      year,
      later,
      weekEnd,
      monthEnd,
      q3End,
      m6End,
      yearEnd,
      totalOpen: open.length,
    };
  }, [searchFiltered]);

  const doneTasks = useMemo(
    () =>
      searchFiltered
        .filter((t) => t.status === "done")
        .sort((a, b) =>
          (b.completed_at ?? "").localeCompare(a.completed_at ?? "")
        ),
    [searchFiltered]
  );

  const doneByMonth = useMemo(() => {
    const map = new Map<string, Task[]>();
    for (const t of doneTasks) {
      const d = t.completed_at ?? "1970-01-01";
      const key = d.slice(0, 7); // YYYY-MM
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(t);
    }
    return Array.from(map.entries());
  }, [doneTasks]);

  const inboxTasks = useMemo(
    () =>
      searchFiltered
        .filter((t) => t.status === "inbox")
        .sort((a, b) => (a.title ?? "").localeCompare(b.title ?? "")),
    [searchFiltered]
  );

  const [graduateId, setGraduateId] = useState<string | null>(null);
  const graduateTask = inboxTasks.find((t) => t.id === graduateId) ?? null;
  const moveToInbox = useStore((s) => s.moveTaskToInbox);
  const deleteTask = useStore((s) => s.deleteTask);

  return (
    <div className="p-4 space-y-6 md:p-10 md:space-y-8">
      <header className="flex flex-col gap-3 border-b border-border pb-5 md:flex-row md:items-baseline md:justify-between md:pb-6">
        <div>
          <h1 className="display text-3xl text-foreground text-glow md:text-4xl">
            Задачи
          </h1>
          <p className="mt-2 text-base text-secondary">
            Когда нужно сделать · что важно сейчас
          </p>
        </div>
        <Button
          onClick={() => setAddOpen(true)}
          className="self-start md:self-auto"
        >
          <Plus className="mr-1.5 h-4 w-4" />
          Создать задачу
        </Button>
      </header>

      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-secondary" />
        <Input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Поиск по задачам — название, ID, описание"
          className="pl-9 pr-9 h-11 text-base"
        />
        {hasQuery && (
          <button
            onClick={() => setQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary hover:text-foreground"
            aria-label="clear"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="-mx-1 flex flex-wrap gap-2 px-1">
        {TABS.map((t) => (
          <Button
            key={t.key}
            variant={tab === t.key ? "default" : "outline"}
            size="sm"
            onClick={() => setTab(t.key)}
            className="font-mono uppercase tracking-wider text-xs"
          >
            {t.label}
            {t.key === "active" && (
              <span className="ml-1.5 num">
                {buckets.totalOpen}
              </span>
            )}
            {t.key === "inbox" && inboxTasks.length > 0 && (
              <span className="ml-1.5 num">{inboxTasks.length}</span>
            )}
            {t.key === "done" && (
              <span className="ml-1.5 num">{doneTasks.length}</span>
            )}
          </Button>
        ))}
      </div>

      {tab === "active" && (
        <div>
          {buckets.totalOpen === 0 && !hasQuery ? (
            <div className="panel corners rounded-md p-6 text-center">
              <div className="display text-xl text-accent-bright">
                Все задачи закрыты
              </div>
              <p className="mt-2 text-base text-secondary">
                Открой /habits или добавь новую задачу
              </p>
            </div>
          ) : (
            <Accordion
              type="multiple"
              defaultValue={["overdue", "today", "week"]}
              {...(hasQuery
                ? {
                    value: [
                      "overdue",
                      "today",
                      "week",
                      "month",
                      "q3",
                      "m6",
                      "year",
                      "later",
                    ],
                  }
                : {})}
              className="space-y-3"
            >
              {buckets.overdue.length > 0 && (
                <Bucket
                  id="overdue"
                  title="Просрочено"
                  tone="danger"
                  tasks={buckets.overdue}
                />
              )}
              <Bucket
                id="today"
                title="Сегодня"
                tone="accent"
                tasks={buckets.today}
              />
              <Bucket
                id="week"
                title="Эта неделя"
                tone="warn"
                hint={`до ${formatDateRu(
                  buckets.weekEnd.toISOString().slice(0, 10)
                )}`}
                tasks={buckets.week}
              />
              <Bucket
                id="month"
                title="Этот месяц"
                tone="muted"
                hint={`до ${formatDateRu(
                  buckets.monthEnd.toISOString().slice(0, 10)
                )}`}
                tasks={buckets.month}
              />
              <Bucket
                id="q3"
                title="3 месяца"
                tone="muted"
                hint={`до ${formatDateRu(
                  buckets.q3End.toISOString().slice(0, 10)
                )}`}
                tasks={buckets.q3}
              />
              <Bucket
                id="m6"
                title="6 месяцев"
                tone="muted"
                hint={`до ${formatDateRu(
                  buckets.m6End.toISOString().slice(0, 10)
                )}`}
                tasks={buckets.m6}
              />
              <Bucket
                id="year"
                title="Год"
                tone="muted"
                hint={`до ${formatDateRu(
                  buckets.yearEnd.toISOString().slice(0, 10)
                )}`}
                tasks={buckets.year}
              />
              {buckets.later.length > 0 && (
                <Bucket
                  id="later"
                  title="Позже года"
                  tone="muted"
                  tasks={buckets.later}
                />
              )}
            </Accordion>
          )}
          <p className="mt-4 font-mono text-[10px] uppercase tracking-wider text-muted leading-relaxed">
            ◆ «Эта неделя», «Этот месяц», «3 месяца» и т.д. — фильтры по
            верхней границе дедлайна, включая сегодня. Одна задача может
            попасть в несколько секций. «Просрочено» и «Сегодня» —
            отдельные, без перекрытия.
          </p>
        </div>
      )}

      {tab === "by_step" && (
        <StepAccordionList
          steps={steps}
          tasks={searchFiltered.filter(
            (t) => t.status !== "done" && t.status !== "inbox"
          )}
        />
      )}

      {tab === "inbox" && (
        <div>
          {inboxTasks.length === 0 ? (
            <div className="panel corners rounded-md p-6 text-center">
              <div className="display text-xl text-accent-bright">
                Inbox пуст
              </div>
              <p className="mt-2 text-base text-secondary">
                Скинь сюда мысль через Quick Capture (+).
              </p>
            </div>
          ) : (
            <div className="space-y-1.5">
              {inboxTasks.map((t) => (
                <div
                  key={t.id}
                  className="flex items-center gap-3 rounded-md border border-border bg-surface px-3 py-2.5"
                >
                  <Inbox className="h-4 w-4 shrink-0 text-secondary" />
                  <span className="flex-1 min-w-0 truncate text-sm text-foreground">
                    {t.title}
                  </span>
                  <button
                    onClick={() => setGraduateId(t.id)}
                    className="shrink-0 rounded-md border border-accent bg-accent/20 px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider text-accent-bright hover:bg-accent/30"
                  >
                    В план
                  </button>
                  <button
                    onClick={() => deleteTask(t.id)}
                    className="shrink-0 text-secondary hover:text-danger-bright"
                    aria-label="Удалить"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === "done" && (
        <div>
          {doneTasks.length === 0 ? (
            <div className="panel corners rounded-md p-6 text-center">
              <div className="display text-xl text-accent-bright">
                Пока ничего не закрыто
              </div>
              <p className="mt-2 text-base text-secondary">
                Сделанные задачи будут собираться здесь.
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              {doneByMonth.map(([month, list]) => (
                <div key={month} className="space-y-2">
                  <div className="flex items-baseline justify-between font-mono text-[10px] uppercase tracking-[0.18em] text-secondary">
                    <span>
                      {format(parseISO(`${month}-01`), "LLLL yyyy", {
                        locale: ru,
                      })}
                    </span>
                    <span className="num text-foreground">
                      {list.length}
                    </span>
                  </div>
                  <div className="space-y-1">
                    {list.map((t) => (
                      <DoneRow key={t.id} task={t} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <TaskFormDialog open={addOpen} onOpenChange={setAddOpen} />
      <TaskFormDialog
        open={!!graduateTask}
        onOpenChange={(o) => !o && setGraduateId(null)}
        task={graduateTask}
      />
    </div>
  );
}
