"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useStore } from "@/lib/store";
import { formatDateRu } from "@/lib/utils";

const numOrDash = (n: number | null) => (n == null ? "—" : String(n));

export function ReviewHistory() {
  const reviews = useStore((s) => s.reviews);

  if (reviews.length === 0) {
    return (
      <div className="rounded border border-border bg-surface p-6 text-sm text-muted">
        Ревью пока нет. Начни первое.
      </div>
    );
  }

  return (
    <Accordion type="multiple" className="space-y-3">
      {reviews.map((r) => (
        <AccordionItem key={r.id} value={r.id}>
          <AccordionTrigger>
            <div className="flex w-full items-center gap-4 pr-4">
              <span className="num shrink-0 text-xs text-foreground">
                {formatDateRu(r.date)}
              </span>
              <span className="flex-1" />
              <div className="flex shrink-0 gap-4 font-mono text-[10px] uppercase tracking-wider text-muted">
                <span>
                  Вес <span className="num text-foreground">{numOrDash(r.weight_kg)}</span>
                </span>
                <span>
                  Постов <span className="num text-foreground">{numOrDash(r.posts_published)}</span>
                </span>
                <span>
                  Apps <span className="num text-foreground">{numOrDash(r.applications_sent)}</span>
                </span>
                <span>
                  EN ч <span className="num text-foreground">{numOrDash(r.english_hours)}</span>
                </span>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="grid grid-cols-2 gap-5">
              <div>
                <div className="font-mono text-xs uppercase tracking-wider text-muted mb-1">
                  Блокеры
                </div>
                <div className="whitespace-pre-line text-sm text-foreground">
                  {r.blockers || "—"}
                </div>
              </div>
              <div>
                <div className="font-mono text-xs uppercase tracking-wider text-muted mb-1">
                  Что было хорошо
                </div>
                <div className="whitespace-pre-line text-sm text-foreground">
                  {r.wins || "—"}
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
