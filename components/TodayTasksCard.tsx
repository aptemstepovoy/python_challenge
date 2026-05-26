"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check,
  ChevronRight,
  ListPlus,
  Play,
  AlertTriangle,
  X,
} from "lucide-react";
import { useStore } from "@/lib/store";
import {
  pickHorizonTasks,
  pickTodayTasks,
  slackDays,
  snoozesLeft,
} from "@/lib/today-logic";
import { haptic } from "@/lib/haptics";
import { cn } from "@/lib/utils";
import type { Task } from "@/lib/types";

function TaskRow({ task, committed }: { task: Task; committed?: boolean }) {
  const today = useMemo(() => new Date(), []);
  const startTask = useStore((s) => s.startTask);
  const completeTask = useStore((s) => s.completeTask);
  const startTimer = useStore((s) => s.startTimer);
  const stopTimer = useStore((s) => s.stopTimer);
  const snoozeTask = useStore((s) => s.snoozeTask);
  const uncommitTask = useStore((s) => s.uncommitTask);
  const snoozesUsedDate = useStore((s) => s.snoozesUsedDate);
  const snoozesUsedCount = useStore((s) => s.snoozesUsedCount);

  const [expanded, setExpanded] = useState(false);
  const slack = slackDays(task, today);
  const started = task.status === "in_progress";
  const overdue = slack < 0;
  const snoozeBudget = snoozesLeft(snoozesUsedDate, snoozesUsedCount, today);

  const borderTone = overdue
    ? "border-danger/60 bg-danger/5"
    : committed
    ? "border-accent/50 bg-accent/5"
    : started
    ? "border-accent/30"
    : "border-border";

  const slackLabel = overdue
    ? `опоздание ${-slack} дн.`
    : slack === 0
    ? "старт сегодня"
    : `+${slack} дн.`;
  const slackTone = overdue
    ? "text-danger-bright"
    : slack === 0
    ? "text-warn"
    : "text-muted";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: 40 }}
      transition={{ duration: 0.15 }}
      className={cn("rounded-md border bg-surface overflow-hidden", borderTone)}
    >
      <button
        onClick={() => {
          haptic("tap");
          setExpanded((v) => !v);
        }}
        className="w-full text-left px-3 py-2.5 flex items-center gap-3"
      >
        <span className="flex-1 min-w-0">
          <span
            className={cn(
              "block text-[14px] truncate",
              overdue ? "text-danger-bright" : "text-foreground"
            )}
          >
            {task.title}
          </span>
          <span
            className={cn(
              "flex items-center gap-1.5 num text-[11px] mt-0.5",
              slackTone
            )}
          >
            {overdue && <AlertTriangle className="h-3 w-3" strokeWidth={2.5} />}
            {slackLabel}
            {started && <span className="text-ok">· в работе</span>}
          </span>
        </span>
        <ChevronRight
          className={cn(
            "h-4 w-4 shrink-0 text-muted transition-transform",
            expanded && "rotate-90"
          )}
        />
      </button>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <div className="px-3 pb-3 pt-1 space-y-2">
              {task.result_definition && (
                <p className="text-xs leading-snug text-secondary">
                  {task.result_definition}
                </p>
              )}
              <div className="flex gap-1.5">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    haptic("tap");
                    if (!started) {
                      startTask(task.id);
                      startTimer(task.id);
                    }
                  }}
                  disabled={started}
                  className={cn(
                    "flex-1 rounded-md border px-2.5 py-1.5 text-xs transition-colors",
                    started
                      ? "border-border bg-surface-2 text-muted"
                      : "border-accent-dim bg-surface text-foreground hover:border-accent"
                  )}
                >
                  <Play className="inline mr-1 h-3 w-3" />
                  {started ? "В работе" : "Начать"}
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    haptic("success");
                    stopTimer();
                    completeTask(task.id);
                  }}
                  className="flex-1 rounded-md border border-accent bg-accent/20 px-2.5 py-1.5 text-xs text-accent-bright hover:bg-accent/30"
                >
                  <Check className="inline mr-1 h-3 w-3" />
                  Сделано
                </button>
                {committed ? (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      uncommitTask(task.id);
                      haptic("tap");
                    }}
                    className="rounded-md border border-border bg-surface px-2.5 py-1.5 text-secondary hover:text-danger-bright"
                    title="Снять с сегодня"
                  >
                    <X className="h-3 w-3" />
                  </button>
                ) : (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (snoozeBudget <= 0) return;
                      haptic("warn");
                      snoozeTask(task.id);
                    }}
                    disabled={snoozeBudget <= 0}
                    className={cn(
                      "rounded-md border px-2.5 py-1.5 text-xs transition-colors",
                      snoozeBudget > 0
                        ? "border-border bg-surface text-secondary hover:text-pink-bright"
                        : "border-border bg-surface text-muted cursor-not-allowed"
                    )}
                  >
                    +1 день
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function Section({
  title,
  count,
  tone,
  children,
  defaultOpen = true,
}: {
  title: string;
  count: number;
  tone: "danger" | "accent" | "muted";
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  if (count === 0) return null;
  const toneClass =
    tone === "danger"
      ? "text-danger-bright"
      : tone === "accent"
      ? "text-accent-bright"
      : "text-muted";
  return (
    <div className="space-y-1.5">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-2 py-1"
      >
        <span className={cn("text-[11px] uppercase tracking-wider", toneClass)}>
          {title}
        </span>
        <span className={cn("num text-[11px]", toneClass)}>{count}</span>
        <span className="flex-1" />
        <ChevronRight
          className={cn(
            "h-3 w-3 text-muted transition-transform",
            open && "rotate-90"
          )}
        />
      </button>
      {open && <div className="space-y-1.5">{children}</div>}
    </div>
  );
}

export function TodayTasksCard() {
  const router = useRouter();
  const allTasks = useStore((s) => s.tasks);
  const today = useMemo(() => new Date(), []);

  const committed = useMemo(
    () =>
      allTasks.filter(
        (t) => t.is_today_committed && t.status !== "done" && t.status !== "inbox"
      ),
    [allTasks]
  );

  const todayList = useMemo(() => pickTodayTasks(allTasks, today), [allTasks, today]);

  const overdueRest = useMemo(
    () =>
      todayList.filter(
        (t) => slackDays(t, today) < 0 && !t.is_today_committed
      ),
    [todayList, today]
  );

  const startTodayRest = useMemo(
    () =>
      todayList.filter(
        (t) => slackDays(t, today) >= 0 && !t.is_today_committed
      ),
    [todayList, today]
  );

  const horizon = useMemo(() => pickHorizonTasks(allTasks, today, 7), [
    allTasks,
    today,
  ]);

  const inProgressCount = useMemo(
    () => allTasks.filter((t) => t.status === "in_progress").length,
    [allTasks]
  );

  const empty =
    committed.length === 0 &&
    overdueRest.length === 0 &&
    startTodayRest.length === 0 &&
    horizon.length === 0;

  if (empty) {
    return (
      <section className="rounded-lg border border-border bg-surface p-5 text-center space-y-2">
        <div className="text-base text-foreground">Задач на сегодня нет</div>
        <button
          onClick={() => {
            haptic("tap");
            router.push("/tasks");
          }}
          className="mx-auto inline-flex items-center gap-1.5 rounded-md border border-accent bg-accent/20 px-3 py-1.5 text-xs text-accent-bright hover:bg-accent/30"
        >
          <ListPlus className="h-3 w-3" />
          Открыть план
        </button>
      </section>
    );
  }

  const wipExceeded = inProgressCount > 3;

  return (
    <section className="space-y-3">
      {wipExceeded && (
        <div className="text-[11px] text-danger-bright num">
          Активных {inProgressCount}/3 — заверши или останови
        </div>
      )}

      <AnimatePresence>
        {overdueRest.length > 0 && (
          <Section title="Просрочено" tone="danger" count={overdueRest.length}>
            {overdueRest.map((t) => (
              <TaskRow key={t.id} task={t} />
            ))}
          </Section>
        )}

        {committed.length > 0 && (
          <Section title="На сегодня" tone="accent" count={committed.length}>
            {committed.map((t) => (
              <TaskRow key={t.id} task={t} committed />
            ))}
          </Section>
        )}

        {startTodayRest.length > 0 && (
          <Section
            title="Стартует сегодня"
            tone="accent"
            count={startTodayRest.length}
          >
            {startTodayRest.map((t) => (
              <TaskRow key={t.id} task={t} />
            ))}
          </Section>
        )}

        {horizon.length > 0 && (
          <Section
            title="На горизонте, 7 дней"
            tone="muted"
            count={horizon.length}
            defaultOpen={false}
          >
            {horizon.map((t) => (
              <TaskRow key={t.id} task={t} />
            ))}
          </Section>
        )}
      </AnimatePresence>

      <button
        onClick={() => {
          haptic("tap");
          router.push("/tasks");
        }}
        className="w-full text-center text-[11px] text-muted hover:text-accent-bright transition-colors"
      >
        Все задачи →
      </button>
    </section>
  );
}
