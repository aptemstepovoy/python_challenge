import { differenceInCalendarDays, parseISO, startOfWeek } from "date-fns";
import type { WeeklyReview, WeightEntry } from "./types";

export type Streak = {
  current: number;
  best: number;
  lastActive: string | null;
};

export function weightStreak(
  entries: WeightEntry[],
  today: Date = new Date()
): Streak {
  if (entries.length === 0) return { current: 0, best: 0, lastActive: null };

  const days = Array.from(
    new Set(entries.map((e) => e.date))
  ).sort();

  let best = 0;
  let run = 1;
  for (let i = 1; i < days.length; i++) {
    const diff = differenceInCalendarDays(
      parseISO(days[i]),
      parseISO(days[i - 1])
    );
    if (diff === 1) {
      run += 1;
    } else {
      best = Math.max(best, run);
      run = 1;
    }
  }
  best = Math.max(best, run);

  const last = days[days.length - 1];
  const gap = differenceInCalendarDays(today, parseISO(last));
  let current = 0;
  if (gap <= 1) {
    current = 1;
    for (let i = days.length - 2; i >= 0; i--) {
      if (
        differenceInCalendarDays(parseISO(days[i + 1]), parseISO(days[i])) === 1
      ) {
        current += 1;
      } else break;
    }
  }
  return { current, best, lastActive: last };
}

export function reviewStreak(
  reviews: WeeklyReview[],
  today: Date = new Date()
): Streak {
  if (reviews.length === 0) return { current: 0, best: 0, lastActive: null };

  const weekStarts = Array.from(
    new Set(
      reviews.map((r) =>
        startOfWeek(parseISO(r.date), { weekStartsOn: 1 })
          .toISOString()
          .slice(0, 10)
      )
    )
  ).sort();

  let best = 0;
  let run = 1;
  for (let i = 1; i < weekStarts.length; i++) {
    const diff = differenceInCalendarDays(
      parseISO(weekStarts[i]),
      parseISO(weekStarts[i - 1])
    );
    if (diff === 7) run += 1;
    else {
      best = Math.max(best, run);
      run = 1;
    }
  }
  best = Math.max(best, run);

  const last = weekStarts[weekStarts.length - 1];
  const thisWeekStart = startOfWeek(today, { weekStartsOn: 1 })
    .toISOString()
    .slice(0, 10);
  const gap = differenceInCalendarDays(
    parseISO(thisWeekStart),
    parseISO(last)
  );

  let current = 0;
  if (gap <= 7) {
    current = 1;
    for (let i = weekStarts.length - 2; i >= 0; i--) {
      if (
        differenceInCalendarDays(
          parseISO(weekStarts[i + 1]),
          parseISO(weekStarts[i])
        ) === 7
      ) {
        current += 1;
      } else break;
    }
  }
  return { current, best, lastActive: last };
}

export function postsStreak(
  reviews: WeeklyReview[],
  today: Date = new Date()
): Streak {
  const withPosts = reviews.filter(
    (r) => r.posts_published != null && r.posts_published > 0
  );
  return reviewStreak(withPosts, today);
}
