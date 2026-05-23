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
      <div className="panel rounded-md p-6 text-base text-secondary">
        Ревью пока нет. Начни первое.
      </div>
    );
  }

  return (
    <Accordion type="multiple" className="space-y-3">
      {reviews.map((r) => (
        <AccordionItem key={r.id} value={r.id}>
          <AccordionTrigger>
            <div className="flex w-full items-center gap-4 pr-3 md:pr-4">
              <span className="num shrink-0 text-base text-foreground">
                {formatDateRu(r.date)}
              </span>
              <span className="flex-1" />
              <div className="hidden shrink-0 gap-5 font-mono text-xs uppercase tracking-wider text-secondary md:flex">
                <span>
                  Вес <span className="num text-foreground text-sm">{numOrDash(r.weight_kg)}</span>
                </span>
                <span>
                  Постов <span className="num text-foreground text-sm">{numOrDash(r.posts_published)}</span>
                </span>
                <span>
                  Apps <span className="num text-foreground text-sm">{numOrDash(r.applications_sent)}</span>
                </span>
                <span>
                  EN ч <span className="num text-foreground text-sm">{numOrDash(r.english_hours)}</span>
                </span>
              </div>
              <span className="num text-xs uppercase tracking-wider text-secondary md:hidden">
                Вес <span className="text-foreground text-sm">{numOrDash(r.weight_kg)}</span>
              </span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-6">
              <div>
                <div className="font-mono text-sm uppercase tracking-wider text-secondary mb-2">
                  Блокеры
                </div>
                <div className="whitespace-pre-line text-base text-foreground">
                  {r.blockers || "—"}
                </div>
              </div>
              <div>
                <div className="font-mono text-sm uppercase tracking-wider text-secondary mb-2">
                  Что было хорошо
                </div>
                <div className="whitespace-pre-line text-base text-foreground">
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
