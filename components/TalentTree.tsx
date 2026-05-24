"use client";

import { useState } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Sparkles, X, Undo2 } from "lucide-react";
import { useStore } from "@/lib/store";
import { BRANCH_META, TALENTS, type TalentBranch } from "@/lib/talents";
import { cn } from "@/lib/utils";
import { haptic } from "@/lib/haptics";
import type { TalentId } from "@/lib/types";

export function TalentTree({ trigger }: { trigger: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const points = useStore((s) => s.talentPoints);
  const earned = useStore((s) => s.talentPointsEarned);
  const ranks = useStore((s) => s.talents);
  const spend = useStore((s) => s.spendTalent);
  const refund = useStore((s) => s.refundTalent);
  const [selected, setSelected] = useState<TalentId | null>(null);

  const rankOf = (id: TalentId) =>
    ranks.find((r) => r.id === id)?.rank ?? 0;

  const branches: TalentBranch[] = [
    "discipline",
    "velocity",
    "fortune",
    "mastery",
  ];

  const selectedDef = selected
    ? TALENTS.find((t) => t.id === selected) ?? null
    : null;

  return (
    <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
      <DialogPrimitive.Trigger asChild>{trigger}</DialogPrimitive.Trigger>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-[70] bg-black/70 backdrop-blur-sm" />
        <DialogPrimitive.Content
          className={cn(
            "fixed left-1/2 top-1/2 z-[71] w-[94vw] max-w-2xl -translate-x-1/2 -translate-y-1/2",
            "max-h-[90vh] overflow-y-auto panel-hero corners rounded-lg p-4 md:p-6"
          )}
        >
          <DialogPrimitive.Title className="sr-only">
            Дерево талантов
          </DialogPrimitive.Title>
          <DialogPrimitive.Close className="absolute right-3 top-3 rounded text-secondary hover:text-foreground">
            <X className="h-5 w-5" />
          </DialogPrimitive.Close>

          <header className="mb-4 flex items-baseline justify-between gap-3 pr-7">
            <div>
              <div className="display text-xl text-foreground text-glow md:text-2xl">
                Таланты
              </div>
              <div className="font-mono text-[10px] uppercase tracking-[0.15em] text-secondary mt-1">
                Точки распределяются на перки. +1 за каждый уровень.
              </div>
            </div>
            <div className="text-right shrink-0">
              <div className="font-mono text-[10px] uppercase tracking-wider text-secondary">
                Очки
              </div>
              <div className="display text-2xl text-accent-bright text-glow num">
                {points}
              </div>
              <div className="font-mono text-[9px] uppercase tracking-wider text-muted mt-0.5">
                всего: {earned}
              </div>
            </div>
          </header>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {branches.map((b) => {
              const meta = BRANCH_META[b];
              const list = TALENTS.filter((t) => t.branch === b).sort(
                (a, z) => a.tier - z.tier
              );
              return (
                <div
                  key={b}
                  className="rounded-md border border-border bg-surface p-3"
                  style={{ borderColor: meta.color + "40" }}
                >
                  <div
                    className="font-mono text-[10px] uppercase tracking-[0.18em] mb-2"
                    style={{ color: meta.color }}
                  >
                    {meta.icon} {meta.label}
                  </div>
                  <div className="space-y-1.5">
                    {list.map((t) => {
                      const rank = rankOf(t.id);
                      const maxed = rank >= t.maxRank;
                      const sel = selected === t.id;
                      return (
                        <button
                          key={t.id}
                          onClick={() => {
                            haptic("tap");
                            setSelected(t.id);
                          }}
                          className={cn(
                            "w-full text-left rounded px-2 py-1.5 transition-colors",
                            sel
                              ? "bg-surface-3 border border-accent-dim"
                              : "bg-surface-2/60 hover:bg-surface-3 border border-transparent"
                          )}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span
                              className={cn(
                                "text-sm",
                                rank > 0
                                  ? "text-foreground"
                                  : "text-foreground/70"
                              )}
                            >
                              {t.name}
                            </span>
                            <span
                              className={cn(
                                "font-mono text-[10px] num shrink-0",
                                maxed
                                  ? "text-ok-bright"
                                  : rank > 0
                                  ? "text-accent-bright"
                                  : "text-secondary"
                              )}
                            >
                              {rank}/{t.maxRank}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {selectedDef && (
            <div className="mt-4 rounded-md border border-accent-dim/50 bg-surface-2/80 p-3">
              <div className="flex items-baseline justify-between gap-2 mb-1">
                <div className="display text-base text-foreground">
                  {selectedDef.name}
                </div>
                <div className="font-mono text-[10px] uppercase tracking-wider text-secondary">
                  {BRANCH_META[selectedDef.branch].label} · tier{" "}
                  {selectedDef.tier}
                </div>
              </div>
              <div className="text-sm text-foreground/85 leading-relaxed">
                {selectedDef.description(
                  Math.max(1, rankOf(selectedDef.id))
                )}
              </div>
              <div className="mt-3 flex items-center gap-2">
                <button
                  onClick={() => {
                    if (spend(selectedDef.id)) haptic("success");
                  }}
                  disabled={
                    points <= 0 ||
                    rankOf(selectedDef.id) >= selectedDef.maxRank
                  }
                  className={cn(
                    "flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm font-mono uppercase tracking-wider transition-colors",
                    points > 0 &&
                      rankOf(selectedDef.id) < selectedDef.maxRank
                      ? "border-accent bg-accent/20 text-accent-bright hover:bg-accent/30"
                      : "border-border bg-surface text-muted cursor-not-allowed"
                  )}
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  Вложить
                </button>
                <button
                  onClick={() => {
                    if (refund(selectedDef.id)) haptic("tap");
                  }}
                  disabled={rankOf(selectedDef.id) <= 0}
                  className={cn(
                    "flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm font-mono uppercase tracking-wider transition-colors",
                    rankOf(selectedDef.id) > 0
                      ? "border-border bg-surface text-foreground hover:border-accent-dim"
                      : "border-border bg-surface text-muted cursor-not-allowed"
                  )}
                >
                  <Undo2 className="h-3.5 w-3.5" />
                  Вернуть
                </button>
              </div>
            </div>
          )}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
