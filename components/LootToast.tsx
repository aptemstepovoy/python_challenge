"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Package, X } from "lucide-react";
import { useStore } from "@/lib/store";
import { getItem, RARITY_COLOR, RARITY_LABEL } from "@/lib/loot";
import { haptic } from "@/lib/haptics";
import type { DropEvent } from "@/lib/types";

const FRESH_WINDOW_SEC = 8;

export function LootToast() {
  const drops = useStore((s) => s.recentDrops);
  const consume = useStore((s) => s.consumeRecentDrop);
  const seenRef = useRef<Set<string>>(new Set());
  const [queue, setQueue] = useState<DropEvent[]>([]);

  useEffect(() => {
    const now = Date.now();
    const fresh: DropEvent[] = [];
    for (const d of drops) {
      if (seenRef.current.has(d.id)) continue;
      seenRef.current.add(d.id);
      const ts = new Date(d.ts).getTime();
      if (Number.isNaN(ts)) continue;
      const ageSec = (now - ts) / 1000;
      if (ageSec >= 0 && ageSec <= FRESH_WINDOW_SEC) {
        fresh.push(d);
      }
    }
    if (fresh.length > 0) {
      haptic("tap");
      setQueue((q) => [...q, ...fresh]);
    }
  }, [drops]);

  useEffect(() => {
    if (queue.length === 0) return;
    const t = setTimeout(() => {
      const head = queue[0];
      setQueue((q) => q.slice(1));
      consume(head.id);
    }, 4500);
    return () => clearTimeout(t);
  }, [queue, consume]);

  if (queue.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 left-4 z-[55] flex flex-col gap-2 pointer-events-none md:left-auto md:max-w-sm">
      <AnimatePresence>
        {queue.slice(0, 2).map((d) => {
          const it = getItem(d.itemId);
          if (!it) return null;
          const color = RARITY_COLOR[d.rarity];
          return (
            <motion.div
              key={d.id}
              initial={{ opacity: 0, x: 60 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 60 }}
              className="panel-bright rounded-md p-3 pointer-events-auto border"
              style={{
                borderColor: color + "70",
                boxShadow: `0 0 24px ${color}40`,
              }}
              onClick={() => {
                setQueue((q) => q.filter((x) => x.id !== d.id));
                consume(d.id);
              }}
            >
              <div className="flex items-start gap-3">
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md text-xl"
                  style={{
                    background: `linear-gradient(135deg, ${color}40, ${color}10)`,
                    color,
                    border: `1px solid ${color}80`,
                  }}
                >
                  {it.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div
                    className="font-mono text-[10px] uppercase tracking-wider"
                    style={{ color }}
                  >
                    {RARITY_LABEL[d.rarity]} · добыча
                  </div>
                  <div className="display text-base text-foreground mt-0.5 truncate">
                    {it.name}
                  </div>
                  <div className="text-xs text-secondary mt-0.5 line-clamp-2">
                    {it.description}
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setQueue((q) => q.filter((x) => x.id !== d.id));
                    consume(d.id);
                  }}
                  className="shrink-0 text-secondary hover:text-foreground"
                  aria-label="close"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
