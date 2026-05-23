"use client";

import { Flame } from "lucide-react";
import { useStore } from "@/lib/store";
import {
  postsStreak,
  reviewStreak,
  weightStreak,
} from "@/lib/streaks";
import { cn } from "@/lib/utils";

function Chip({
  label,
  value,
  active,
}: {
  label: string;
  value: number;
  active: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded border px-3 py-2",
        active
          ? "border-accent/40 bg-accent/5 text-foreground"
          : "border-border bg-surface text-muted"
      )}
    >
      <Flame
        className={cn(
          "h-3.5 w-3.5",
          active ? "text-accent" : "text-muted/50"
        )}
        strokeWidth={2}
      />
      <div className="flex items-baseline gap-1">
        <span className="num text-base text-foreground">{value}</span>
        <span className="font-mono text-[10px] uppercase tracking-wider text-muted">
          {label}
        </span>
      </div>
    </div>
  );
}

export function StreakChips() {
  const reviews = useStore((s) => s.reviews);
  const weightEntries = useStore((s) => s.weightEntries);

  const review = reviewStreak(reviews);
  const weight = weightStreak(weightEntries);
  const posts = postsStreak(reviews);

  return (
    <div className="flex flex-wrap gap-2">
      <Chip label="Ревью нед." value={review.current} active={review.current > 0} />
      <Chip label="Вес дн." value={weight.current} active={weight.current > 0} />
      <Chip label="Постов нед." value={posts.current} active={posts.current > 0} />
    </div>
  );
}
