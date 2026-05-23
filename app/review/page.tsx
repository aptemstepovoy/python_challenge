"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ReviewForm } from "@/components/ReviewForm";
import { ReviewHistory } from "@/components/ReviewHistory";
import { useStore } from "@/lib/store";
import { differenceInCalendarDays, parseISO } from "date-fns";

export default function ReviewPage() {
  const reviews = useStore((s) => s.reviews);
  const [showForm, setShowForm] = useState(false);

  const stats = useMemo(() => {
    const now = new Date();
    const lastMonth = reviews.filter(
      (r) => differenceInCalendarDays(now, parseISO(r.date)) <= 30
    );
    const weights = lastMonth
      .map((r) => r.weight_kg)
      .filter((w): w is number => w != null);
    const avgWeight =
      weights.length > 0
        ? weights.reduce((a, b) => a + b, 0) / weights.length
        : null;
    const posts = lastMonth
      .map((r) => r.posts_published)
      .filter((p): p is number => p != null)
      .reduce((a, b) => a + b, 0);
    return {
      total: reviews.length,
      avgWeight,
      postsMonth: posts,
    };
  }, [reviews]);

  return (
    <div className="p-4 space-y-5 md:p-10 md:space-y-6">
      <header className="flex flex-col gap-3 border-b border-border pb-5 md:flex-row md:items-baseline md:justify-between md:pb-6">
        <div>
          <h1 className="display text-2xl text-foreground text-glow md:text-3xl">
            Weekly review
          </h1>
          <p className="mt-1 text-sm text-muted">Воскресенье · 19:00</p>
        </div>
        {!showForm && (
          <Button onClick={() => setShowForm(true)} className="self-start md:self-auto">Начать ревью</Button>
        )}
      </header>

      {showForm && (
        <ReviewForm
          onSubmitted={() => {
            setShowForm(false);
          }}
        />
      )}

      <section>
        <h2 className="mb-3 font-mono text-xs uppercase tracking-[0.2em] text-muted">
          История
        </h2>
        <ReviewHistory />
      </section>

      <section>
        <Card className="p-6">
          <h3 className="mb-4 font-mono text-sm uppercase tracking-wider text-muted">
            Метрики
          </h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 md:gap-4">
            <div className="rounded border border-border bg-surface-2 p-4">
              <div className="font-mono text-[10px] uppercase tracking-wider text-muted">
                Всего ревью
              </div>
              <div className="num mt-1 text-2xl text-foreground">{stats.total}</div>
            </div>
            <div className="rounded border border-border bg-surface-2 p-4">
              <div className="font-mono text-[10px] uppercase tracking-wider text-muted">
                Средний вес (мес)
              </div>
              <div className="num mt-1 text-2xl text-foreground">
                {stats.avgWeight != null ? stats.avgWeight.toFixed(1) : "—"}
              </div>
            </div>
            <div className="rounded border border-border bg-surface-2 p-4">
              <div className="font-mono text-[10px] uppercase tracking-wider text-muted">
                Постов за месяц
              </div>
              <div className="num mt-1 text-2xl text-foreground">
                {stats.postsMonth}
              </div>
            </div>
          </div>
        </Card>
      </section>
    </div>
  );
}
