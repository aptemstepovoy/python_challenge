"use client";

import { useMemo, useState } from "react";
import { differenceInCalendarDays, format, parseISO } from "date-fns";
import { ru } from "date-fns/locale";
import { Lightbulb, Mic, Search, Trash2, X } from "lucide-react";
import { useStore } from "@/lib/store";
import { Input, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { VoiceInput } from "@/components/VoiceInput";
import { haptic } from "@/lib/haptics";
import { cn } from "@/lib/utils";

const todayISO = () => new Date().toISOString().slice(0, 10);

export default function InsightsPage() {
  const insights = useStore((s) => s.insights);
  const addInsight = useStore((s) => s.addInsight);
  const deleteInsight = useStore((s) => s.deleteInsight);

  const [text, setText] = useState("");
  const [usedVoice, setUsedVoice] = useState(false);
  const [query, setQuery] = useState("");

  const today = new Date();
  const total = insights.length;
  const thisWeek = insights.filter(
    (i) => differenceInCalendarDays(today, parseISO(i.date)) <= 7
  ).length;
  const last30 = insights.filter(
    (i) => differenceInCalendarDays(today, parseISO(i.date)) <= 30
  ).length;
  const byVoice = insights.filter((i) => i.source === "voice").length;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = q
      ? insights.filter((i) => i.text.toLowerCase().includes(q))
      : insights;
    return [...list].sort((a, b) =>
      (b.created_at ?? b.date).localeCompare(a.created_at ?? a.date)
    );
  }, [insights, query]);

  // Группируем по дате (YYYY-MM-DD).
  const groups = useMemo(() => {
    const map = new Map<string, typeof filtered>();
    for (const i of filtered) {
      const k = i.date;
      if (!map.has(k)) map.set(k, []);
      map.get(k)!.push(i);
    }
    return Array.from(map.entries());
  }, [filtered]);

  const save = () => {
    if (!text.trim()) return;
    haptic("success");
    addInsight({
      date: todayISO(),
      text: text.trim(),
      source: usedVoice ? "voice" : "text",
    });
    setText("");
    setUsedVoice(false);
  };

  const remove = (id: string) => {
    haptic("warn");
    deleteInsight(id);
  };

  return (
    <div className="p-4 space-y-6 md:p-8 md:space-y-8 max-w-3xl mx-auto">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold text-foreground md:text-3xl">
          Инсайты
        </h1>
        <p className="text-sm text-secondary">
          Что нового понял, идеи, наблюдения — в одну ленту.
        </p>
      </header>

      {/* Метрики */}
      <section className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Metric label="Всего" value={total} />
        <Metric label="За неделю" value={thisWeek} />
        <Metric label="За месяц" value={last30} />
        <Metric label="Голосом" value={byVoice} />
      </section>

      {/* Быстрая запись */}
      <section className="rounded-lg border border-border bg-surface p-4 space-y-2">
        <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider text-secondary">
          <Lightbulb className="h-3.5 w-3.5" />
          Записать сейчас
        </div>
        <div className="flex gap-2">
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={3}
            placeholder="мысль, идея, наблюдение…"
            className="flex-1"
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) save();
            }}
          />
          <VoiceInput
            onAppend={(chunk) => {
              setUsedVoice(true);
              setText((prev) =>
                prev ? `${prev.trimEnd()} ${chunk}` : chunk
              );
            }}
          />
        </div>
        <div className="flex items-center justify-between">
          <div className="text-[11px] text-muted">
            {usedVoice && (
              <span className="flex items-center gap-1">
                <Mic className="h-3 w-3" /> голос
              </span>
            )}
          </div>
          <Button onClick={save} size="sm" disabled={!text.trim()}>
            Сохранить
          </Button>
        </div>
      </section>

      {/* Поиск */}
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
        <Input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Поиск по инсайтам"
          className="pl-9 pr-9 h-10"
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground"
            aria-label="clear"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Лента */}
      <section className="space-y-5">
        {groups.length === 0 ? (
          <div className="rounded-md border border-border bg-surface p-6 text-center">
            <Lightbulb className="h-6 w-6 mx-auto text-muted mb-2" />
            <div className="text-sm text-secondary">
              {query
                ? "По этому поиску ничего"
                : "Ещё нет инсайтов. Запиши первый — даже одну строку."}
            </div>
          </div>
        ) : (
          groups.map(([date, list]) => (
            <div key={date} className="space-y-2">
              <div className="flex items-baseline justify-between text-[11px] uppercase tracking-wider text-secondary">
                <span>
                  {format(parseISO(date), "EEEE, d MMMM", { locale: ru })}
                </span>
                <span className="num text-muted">{list.length}</span>
              </div>
              <div className="space-y-1.5">
                {list.map((i) => (
                  <div
                    key={i.id}
                    className={cn(
                      "group rounded-md border border-border bg-surface px-3 py-2.5 flex items-start gap-2.5"
                    )}
                  >
                    <Lightbulb className="h-4 w-4 shrink-0 mt-0.5 text-accent-bright/60" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground leading-snug whitespace-pre-wrap">
                        {i.text}
                      </p>
                      {(i.created_at || i.source === "voice") && (
                        <div className="mt-1 flex items-center gap-2 text-[10px] text-muted num">
                          {i.created_at && (
                            <span>
                              {format(parseISO(i.created_at), "HH:mm")}
                            </span>
                          )}
                          {i.source === "voice" && (
                            <span className="flex items-center gap-0.5">
                              <Mic className="h-2.5 w-2.5" />
                              голос
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => remove(i.id)}
                      className="shrink-0 text-muted hover:text-danger-bright opacity-0 group-hover:opacity-100 transition-opacity"
                      aria-label="Удалить"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </section>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md border border-border bg-surface p-3">
      <div className="text-[10px] uppercase tracking-wider text-secondary">
        {label}
      </div>
      <div className="num mt-1 text-xl text-foreground">{value}</div>
    </div>
  );
}
