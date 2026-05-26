"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check,
  ChevronRight,
  ListPlus,
  Play,
  Sparkles,
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
import { BossLinkPill } from "@/components/BossLinkPill";

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
    ? "border-accent/60 bg-accent/10"
    : started
    ? "border-accent/40 bg-accent/5"
    : "border-border bg-surface";

  const slackLabel = overdue
    ? `Опаздываешь ${-slack} дн.`
    : slack === 0
    ? "Старт сегодня"
    : `${slack} дн. запас`;
  const slackTone = overdue
    ? "text-danger-bright"
    : slack === 0
    ? "text-warn"
    : "text-secondary";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: 40 }}
      transition={{ duration: 0.18 }}
      className={cn(
        "rounded-md border transition-colors overflow-hidden",
        borderTone
      )}
    >
      <button
        onClick={() => {
          haptic("tap");
          setExpanded((v) => !v);
        }}
        className="w-full text-left px-3 py-2.5 flex items-center gap-2.5"
      >
        <span className="num shrink-0 text-[10px] text-muted">{task.id}</span>
        <span className="flex-1 min-w-0">
          <span
            className={cn(
              "block text-sm truncate",
              overdue ? "text-danger-bright" : "text-foreground"
            )}
          >
            {task.title}
          </span>
          <span
            className={cn(
              "flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider mt-0.5",
              slackTone
            )}
          >
            {overdue && (
              <AlertTriangle className="h-3 w-3" strokeWidth={2.5} />
            )}
            {slackLabel}
            <span className="text-accent-bright">· +{task.xp ?? 25}</span>
            {started && <span className="text-ok">· в работе</span>}
            <BossLinkPill bossId={task.linked_boss} className="ml-1" />
          </span>
        </span>
        <ChevronRight
          className={cn(
            "h-4 w-4 shrink-0 text-secondary transition-transform",
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
            transition={{ duration: 0.18 }}
          >
            <div className="px-3 pb-2.5 pt-1 space-y-2">
              {task.result_definition && (
                <p className="text-xs leading-snug text-secondary">
                  {task.result_definition}
                </p>
              )}
              <div className="flex flex-col gap-1.5 sm:flex-row">
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
                    "flex-1 rounded-md border px-2.5 py-1.5 text-xs font-mono uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors",
                    started
                      ? "border-border bg-surface-2 text-muted"
                      : "border-accent-dim bg-surface-2 text-foreground hover:border-accent"
                  )}
                >
                  <Play className="h-3 w-3" />
                  {started ? "В работе" : "Начать"}
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    haptic("success");
                    stopTimer();
                    completeTask(task.id);
                  }}
                  className="flex-1 rounded-md border border-accent bg-accent/20 px-2.5 py-1.5 text-xs font-mono uppercase tracking-wider text-accent-bright hover:bg-accent/30 flex items-center justify-center gap-1.5"
                >
                  <Check className="h-3 w-3" />
                  Сделано
                </button>
                {committed ? (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      uncommitTask(task.id);
                      haptic("tap");
                    }}
                    className="rounded-md border border-border bg-surface px-2.5 py-1.5 text-xs font-mono uppercase tracking-wider text-secondary hover:text-danger-bright hover:border-danger/40"
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
                      "rounded-md border px-2.5 py-1.5 text-xs font-mono uppercase tracking-wider transition-colors",
                      snoozeBudget > 0
                        ? "border-border bg-surface text-secondary hover:text-pink-bright hover:border-pink/40"
                        : "border-border bg-surface text-muted cursor-not-allowed"
                    )}
                  >
                    Не сегодня ({snoozeBudget})
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
      : "text-secondary";
  return (
    <div className="space-y-1.5">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-2"
      >
        <span
          className={cn(
            "font-mono text-[10px] uppercase tracking-[0.18em]",
            toneClass
          )}
        >
          ◆ {title}
        </span>
        <span className={cn("num text-[10px]", toneClass)}>{count}</span>
        <span className="flex-1" />
        <ChevronRight
          className={cn(
            "h-3 w-3 text-secondary transition-transform",
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

  const today_list = useMemo(() => pickTodayTasks(allTasks, today), [
    allTasks,
    today,
  ]);

  const overdueRest = useMemo(
    () =>
      today_list.filter(
        (t) => slackDays(t, today) < 0 && !t.is_today_committed
      ),
    [today_list, today]
  );

  const startTodayRest = useMemo(
    () =>
      today_list.filter(
        (t) => slackDays(t, today) >= 0 && !t.is_today_committed
      ),
    [today_list, today]
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
      <div className="panel-bright corners rounded-md p-4 md:p-5 text-center space-y-3">
        <Sparkles className="h-6 w-6 text-accent-bright mx-auto" />
        <div className="display text-lg text-accent-bright">
          На сегодня задач нет
        </div>
        <p className="text-sm text-secondary px-2 leading-snug">
          Но ты можешь взять задачу сам
        </p>
        <button
          onClick={() => {
            haptic("tap");
            router.push("/tasks");
          }}
          className="mx-auto rounded-md border border-accent bg-accent/20 px-3 py-1.5 text-xs font-mono uppercase tracking-wider text-accent-bright hover:bg-accent/30 flex items-center gap-1.5"
        >
          <ListPlus className="h-3 w-3" />
          Взять задачу
        </button>
      </div>
    );
  }

  const wipExceeded = inProgressCount > 3;

  return (
    <div className="panel-bright corners rounded-md p-3 md:p-4 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2 font-mono text-[10px] uppercase tracking-wider">
        <div className="flex flex-wrap items-center gap-2">
          {overdueRest.length > 0 && (
            <span className="text-danger-bright num">
              {overdueRest.length} просрочено
            </span>
          )}
          <span className="text-secondary">·</span>
          <span className="text-foreground num">
            {committed.length}/3 на сегодня
          </span>
          <span className="text-secondary">·</span>
          <span className="text-secondary num">
            {horizon.length} на горизонте
          </span>
        </div>
        {wipExceeded && (
          <span className="text-danger-bright num">
            Активных {inProgressCount}/3 — заверши или останови
          </span>
        )}
      </div>

      <AnimatePresence>
        {overdueRest.length > 0 && (
          <Section
            title="Просрочено"
            tone="danger"
            count={overdueRest.length}
            defaultOpen
          >
            {overdueRest.map((t) => (
              <TaskRow key={t.id} task={t} />
            ))}
          </Section>
        )}

        {committed.length > 0 && (
          <Section
            title="На сегодня"
            tone="accent"
            count={committed.length}
            defaultOpen
          >
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
            defaultOpen
          >
            {startTodayRest.map((t) => (
              <TaskRow key={t.id} task={t} />
            ))}
          </Section>
        )}

        {horizon.length > 0 && (
          <Section
            title="На горизонте · 7 дней"
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
        className="w-full text-center font-mono text-[10px] uppercase tracking-wider text-secondary hover:text-accent-bright"
      >
        Все задачи →
      </button>
    </div>
  );
}
