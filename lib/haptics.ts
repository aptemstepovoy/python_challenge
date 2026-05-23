"use client";

type Pattern = "tap" | "success" | "error" | "warn";

const patterns: Record<Pattern, number | number[]> = {
  tap: 10,
  success: [10, 40, 30],
  error: [40, 30, 40],
  warn: 25,
};

export function haptic(p: Pattern = "tap") {
  if (typeof window === "undefined") return;
  const nav = window.navigator;
  if (!nav || typeof nav.vibrate !== "function") return;
  try {
    nav.vibrate(patterns[p]);
  } catch {
    /* noop */
  }
}
