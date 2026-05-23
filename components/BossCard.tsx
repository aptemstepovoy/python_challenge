"use client";

import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import type { BossState } from "@/lib/bosses-logic";
import { differenceInCalendarDays, parseISO } from "date-fns";
import { formatDateRu } from "@/lib/utils";

export function BossCard({ state }: { state: BossState }) {
  const { boss, hpRemaining, hpPercent, defeated, taskDamage, habitDamage } =
    state;
  const today = new Date();
  const daysLeft = differenceInCalendarDays(parseISO(boss.target_date), today);
  const totalDamage = boss.total_hp - hpRemaining;

  return (
    <Card className="p-5">
      <div className="mb-3 flex items-center justify-between">
        <div className="font-mono text-base tracking-wider text-foreground">
          {boss.name}
        </div>
        {defeated ? (
          <Badge tone="ok">Побеждён</Badge>
        ) : daysLeft < 0 ? (
          <Badge tone="danger">Время вышло</Badge>
        ) : (
          <Badge tone="accent">{daysLeft} дн.</Badge>
        )}
      </div>

      <p className="mb-4 text-sm text-muted">{boss.description}</p>

      <div className="mb-2 flex items-baseline justify-between font-mono text-[10px] uppercase tracking-wider text-muted">
        <span>
          HP{" "}
          <span className="num text-foreground">{hpRemaining}</span> /{" "}
          {boss.total_hp}
        </span>
        <span>
          урон{" "}
          <span className="num text-accent">{totalDamage}</span>
        </span>
      </div>

      <Progress
        value={defeated ? 100 : 100 - hpPercent}
        tone={defeated ? "ok" : daysLeft < 0 ? "danger" : "accent"}
        className="mb-3"
      />

      <div className="grid grid-cols-2 gap-3 font-mono text-[10px] uppercase tracking-wider text-muted">
        <div>
          задачи <span className="num text-foreground/80">{taskDamage}</span>
        </div>
        <div>
          привычки <span className="num text-foreground/80">{habitDamage}</span>
        </div>
        <div className="col-span-2">
          до <span className="num text-foreground/80">{formatDateRu(boss.target_date)}</span>{" "}
          · награда{" "}
          <span className="num text-accent">+{boss.reward_xp}</span> XP
        </div>
      </div>
    </Card>
  );
}
