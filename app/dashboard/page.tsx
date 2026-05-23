"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { KGICard } from "@/components/KGICard";
import { WeightChart } from "@/components/WeightChart";
import { DeadlinesList } from "@/components/DeadlinesList";
import { useStore } from "@/lib/store";
import { formatDateRu } from "@/lib/utils";

export default function DashboardPage() {
  const kgis = useStore((s) => s.kgis);
  const tasks = useStore((s) => s.tasks);
  const [today, setToday] = useState<string | null>(null);

  useEffect(() => {
    setToday(formatDateRu(new Date()));
  }, []);

  const stats = {
    total: tasks.length,
    done: tasks.filter((t) => t.status === "done").length,
    in_progress: tasks.filter((t) => t.status === "in_progress").length,
    todo: tasks.filter((t) => t.status === "todo").length,
    blocked: tasks.filter((t) => t.status === "blocked").length,
  };

  return (
    <div className="p-4 space-y-6 md:p-10 md:space-y-8">
      <header className="flex flex-col gap-2 border-b border-border pb-5 md:flex-row md:items-baseline md:justify-between md:pb-6">
        <div>
          <h1 className="display text-2xl text-foreground text-glow md:text-3xl">
            К свободе через систему
          </h1>
          <p className="mt-1 text-sm text-muted">
            12-месячный план · MVP → Бали → Свобода
          </p>
        </div>
        <div className="num text-xs uppercase tracking-wider text-muted">
          {today ?? ""}
        </div>
      </header>

      <section>
        <h2 className="mb-4 font-mono text-xs uppercase tracking-[0.2em] text-muted">
          KGI · Ключевые цели
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {kgis.map((k) => (
            <KGICard key={k.id} kgi={k} />
          ))}
        </div>
      </section>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Вес · план vs факт</CardTitle>
          </CardHeader>
          <CardContent>
            <WeightChart />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ближайшие дедлайны</CardTitle>
          </CardHeader>
          <CardContent>
            <DeadlinesList />
          </CardContent>
        </Card>
      </section>

      <section>
        <Card>
          <CardHeader>
            <CardTitle>Mini-stats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5 md:gap-4">
              {[
                { label: "Всего", value: stats.total, tone: "text-foreground" },
                { label: "Сделано", value: stats.done, tone: "text-ok" },
                { label: "В работе", value: stats.in_progress, tone: "text-accent" },
                { label: "В ожидании", value: stats.todo, tone: "text-foreground/70" },
                { label: "Блок", value: stats.blocked, tone: "text-danger" },
              ].map((s) => (
                <div key={s.label} className="rounded border border-border bg-surface-2 p-4">
                  <div className="font-mono text-[10px] uppercase tracking-wider text-muted">
                    {s.label}
                  </div>
                  <div className={`num mt-1 text-2xl ${s.tone}`}>{s.value}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
