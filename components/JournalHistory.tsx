"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";
import { formatDateRu } from "@/lib/utils";
import { Trash2 } from "lucide-react";
import type { JournalState } from "@/lib/types";

const STATE_LABEL: Record<JournalState, { label: string; color: string }> = {
  great: { label: "Огонь", color: "#34d399" },
  good: { label: "Хорошо", color: "#a78bfa" },
  neutral: { label: "Норм", color: "#b8b1cc" },
  tired: { label: "Устал", color: "#fbbf24" },
  down: { label: "Плохо", color: "#f87171" },
};

export function JournalHistory() {
  const journals = useStore((s) => s.journals);
  const deleteJournal = useStore((s) => s.deleteJournal);

  if (journals.length === 0) {
    return (
      <div className="panel rounded-md p-6 text-base text-secondary">
        Записей пока нет. Заполни форму выше — это даст +30 XP и материал
        для анализа недели.
      </div>
    );
  }

  const confirmDelete = (id: string, date: string) => {
    if (
      typeof window !== "undefined" &&
      window.confirm(`Удалить запись за ${date}?`)
    ) {
      deleteJournal(id);
    }
  };

  return (
    <Accordion type="multiple" className="space-y-3">
      {journals.map((j) => {
        const state = STATE_LABEL[j.state];
        return (
          <AccordionItem key={j.id} value={j.id}>
            <AccordionTrigger>
              <div className="flex w-full items-center gap-3 pr-3">
                <span className="num shrink-0 text-base text-foreground">
                  {formatDateRu(j.date)}
                </span>
                <span
                  className="font-mono text-xs uppercase tracking-wider px-2 py-0.5 rounded border"
                  style={{ borderColor: `${state.color}80`, color: state.color }}
                >
                  {state.label}
                </span>
                <span className="flex-1" />
                <span className="hidden md:inline truncate text-sm text-secondary max-w-xs">
                  {j.done_today.slice(0, 60) || "—"}
                </span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4">
                {j.done_today && (
                  <div>
                    <div className="font-mono text-xs uppercase tracking-wider text-secondary mb-1">
                      Что сделано
                    </div>
                    <div className="whitespace-pre-line text-base text-foreground">
                      {j.done_today}
                    </div>
                  </div>
                )}
                {j.focus_tomorrow && (
                  <div>
                    <div className="font-mono text-xs uppercase tracking-wider text-secondary mb-1">
                      Фокус на завтра
                    </div>
                    <div className="whitespace-pre-line text-base text-foreground">
                      {j.focus_tomorrow}
                    </div>
                  </div>
                )}
                {j.insights && (
                  <div>
                    <div className="font-mono text-xs uppercase tracking-wider text-secondary mb-1">
                      Инсайты
                    </div>
                    <div className="whitespace-pre-line text-base text-foreground">
                      {j.insights}
                    </div>
                  </div>
                )}
                {j.reflection && (
                  <div>
                    <div className="font-mono text-xs uppercase tracking-wider text-secondary mb-1">
                      Рефлексия
                    </div>
                    <div className="whitespace-pre-line text-base text-foreground">
                      {j.reflection}
                    </div>
                  </div>
                )}
                <div className="flex justify-end pt-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => confirmDelete(j.id, formatDateRu(j.date))}
                    className="text-danger-bright hover:bg-danger/10"
                  >
                    <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                    Удалить
                  </Button>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
}
