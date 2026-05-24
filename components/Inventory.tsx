"use client";

import { useState } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X, Package } from "lucide-react";
import { useStore } from "@/lib/store";
import {
  getItem,
  ITEMS,
  RARITY_COLOR,
  RARITY_LABEL,
} from "@/lib/loot";
import { cn } from "@/lib/utils";
import { haptic } from "@/lib/haptics";
import type { ItemId, Rarity } from "@/lib/types";

const RARITY_ORDER: Rarity[] = [
  "legendary",
  "epic",
  "rare",
  "uncommon",
  "common",
];

export function Inventory({ trigger }: { trigger: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const inventory = useStore((s) => s.inventory);
  const useItem = useStore((s) => s.useItem);
  const [selected, setSelected] = useState<ItemId | null>(null);

  const items = inventory
    .map((e) => ({ entry: e, def: getItem(e.itemId) }))
    .filter((x) => !!x.def)
    .sort((a, z) => {
      const ai = RARITY_ORDER.indexOf(a.def!.rarity);
      const zi = RARITY_ORDER.indexOf(z.def!.rarity);
      return ai - zi;
    });

  const selectedDef = selected ? getItem(selected) : null;
  const selectedEntry = inventory.find((i) => i.itemId === selected);

  const totalSlots = ITEMS.length;
  const ownedSlots = inventory.length;

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
            Инвентарь
          </DialogPrimitive.Title>
          <DialogPrimitive.Close className="absolute right-3 top-3 rounded text-secondary hover:text-foreground">
            <X className="h-5 w-5" />
          </DialogPrimitive.Close>

          <header className="mb-4 flex items-baseline justify-between pr-7">
            <div>
              <div className="display text-xl text-foreground text-glow md:text-2xl">
                Инвентарь
              </div>
              <div className="font-mono text-[10px] uppercase tracking-[0.15em] text-secondary mt-1">
                Лут с задач, привычек и ревью. Расходники → тап для применения.
              </div>
            </div>
            <div className="text-right shrink-0">
              <div className="font-mono text-[10px] uppercase tracking-wider text-secondary">
                Собрано
              </div>
              <div className="display text-2xl text-accent-bright text-glow num">
                {ownedSlots}
                <span className="text-secondary text-sm"> / {totalSlots}</span>
              </div>
            </div>
          </header>

          {items.length === 0 && (
            <div className="rounded-md border border-border bg-surface p-6 text-center">
              <Package className="h-8 w-8 text-secondary mx-auto mb-2" />
              <div className="text-sm text-secondary">
                Пусто. Закрывай задачи и привычки — есть шанс выпадения предмета.
              </div>
            </div>
          )}

          {items.length > 0 && (
            <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 md:grid-cols-7">
              {items.map(({ entry, def }) => {
                const color = RARITY_COLOR[def!.rarity];
                const sel = selected === entry.itemId;
                return (
                  <button
                    key={entry.itemId}
                    onClick={() => {
                      haptic("tap");
                      setSelected(entry.itemId);
                    }}
                    className={cn(
                      "aspect-square rounded-md border p-1 flex items-center justify-center text-2xl relative transition-colors",
                      sel ? "ring-2 ring-accent-bright" : ""
                    )}
                    style={{
                      borderColor: color + "70",
                      background: `linear-gradient(135deg, ${color}1a, ${color}05)`,
                      color,
                    }}
                  >
                    {def!.icon}
                    {entry.count > 1 && (
                      <span className="absolute bottom-0.5 right-1 font-mono text-[9px] text-foreground bg-background/80 rounded px-1 num">
                        ×{entry.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {selectedDef && selectedEntry && (
            <div
              className="mt-4 rounded-md border p-3"
              style={{
                borderColor: RARITY_COLOR[selectedDef.rarity] + "70",
                background: `linear-gradient(135deg, ${RARITY_COLOR[selectedDef.rarity]}10, transparent)`,
              }}
            >
              <div className="flex items-baseline justify-between gap-2 mb-1">
                <div className="display text-base text-foreground">
                  {selectedDef.name}
                </div>
                <div
                  className="font-mono text-[10px] uppercase tracking-wider"
                  style={{ color: RARITY_COLOR[selectedDef.rarity] }}
                >
                  {RARITY_LABEL[selectedDef.rarity]} · ×{selectedEntry.count}
                </div>
              </div>
              <div className="text-sm text-foreground/85 leading-relaxed">
                {selectedDef.description}
              </div>
              {selectedDef.kind === "consumable" && (
                <button
                  onClick={() => {
                    if (useItem(selectedDef.id)) {
                      haptic("success");
                    }
                  }}
                  className="mt-3 rounded-md border border-accent bg-accent/20 px-3 py-1.5 text-sm font-mono uppercase tracking-wider text-accent-bright hover:bg-accent/30"
                >
                  Использовать
                </button>
              )}
              {selectedDef.kind === "cosmetic" && (
                <div className="mt-2 font-mono text-[10px] uppercase tracking-wider text-secondary">
                  Косметика · автоматически в коллекции
                </div>
              )}
              {selectedDef.kind === "trophy" && (
                <div className="mt-2 font-mono text-[10px] uppercase tracking-wider text-gold">
                  Трофей · вечная отметка
                </div>
              )}
              {selectedDef.kind === "shard" && (
                <div className="mt-2 font-mono text-[10px] uppercase tracking-wider text-secondary">
                  Осколок · копится в запасе
                </div>
              )}
            </div>
          )}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
