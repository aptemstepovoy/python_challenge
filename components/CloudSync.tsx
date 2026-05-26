"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { createClient } from "@/lib/supabase/client";
import { SUPABASE_ENABLED } from "@/lib/supabase/env";

const PERSIST_KEYS = [
  "kgis",
  "steps",
  "tasks",
  "reviews",
  "weightEntries",
  "habits",
  "habitLogs",
  "xp",
  "achievements",
  "lastIntroDate",
  "snoozesUsedDate",
  "snoozesUsedCount",
  "journals",
  "insights",
  "activeTimerTaskId",
  "activeTimerStartedAt",
  "dailyXPGoal",
  "dailyXPHistory",
  "lastChestOpened",
  "chestStreak",
  "totalChestsOpened",
  "chestHistory",
  "dailyQuests",
  "streakFreezes",
  "streakFreezesEarned",
  "talentPoints",
  "talentPointsEarned",
  "talents",
  "inventory",
  "recentDrops",
  "lastLevelClaimed",
  "accountStartDate",
  "dailyPlans",
  "efforts",
  "effortLogs",
  "dailyCapacityHours",
  "preferredEnergyMorning",
  "preferredEnergyAfternoon",
  "preferredEnergyEvening",
  "inboxTasks",
  "vision",
] as const;

function snapshot(state: ReturnType<typeof useStore.getState>) {
  const out: Record<string, unknown> = {};
  for (const k of PERSIST_KEYS) {
    out[k] = (state as Record<string, unknown>)[k];
  }
  return out;
}

export function CloudSync() {
  const pathname = usePathname();
  const router = useRouter();
  const loadedRef = useRef(false);
  const pushTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastPushAtRef = useRef<string | null>(null);

  useEffect(() => {
    if (!SUPABASE_ENABLED) return;
    if (pathname?.startsWith("/login") || pathname?.startsWith("/signup")) return;

    let cancelled = false;
    const sb = createClient();
    if (!sb) return;

    const init = async () => {
      const {
        data: { user },
      } = await sb.auth.getUser();
      if (!user || cancelled) return;

      const { data, error } = await sb
        .from("user_state")
        .select("state, updated_at")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) {
        loadedRef.current = true;
        return;
      }

      if (data?.state && typeof data.state === "object") {
        try {
          useStore.setState(
            data.state as Partial<ReturnType<typeof useStore.getState>>,
            false
          );
          lastPushAtRef.current = data.updated_at;
        } catch {
          /* ignore */
        }
      } else {
        // No cloud record → brand-new account. Wipe any leftover local
        // state from a previous session before seeding the cloud row,
        // otherwise a deleted-and-recreated user inherits old XP/tasks.
        useStore.getState().resetData();
        useStore.setState({ accountStartDate: new Date().toISOString().slice(0, 10) });
        const payload = snapshot(useStore.getState());
        await sb
          .from("user_state")
          .upsert(
            { user_id: user.id, state: payload, updated_at: new Date().toISOString() },
            { onConflict: "user_id" }
          );
      }
      loadedRef.current = true;
    };

    init();

    const unsub = useStore.subscribe((state) => {
      if (!loadedRef.current) return;
      if (pushTimerRef.current) clearTimeout(pushTimerRef.current);
      pushTimerRef.current = setTimeout(async () => {
        const {
          data: { user },
        } = await sb.auth.getUser();
        if (!user) return;
        const payload = snapshot(state);
        await sb
          .from("user_state")
          .upsert(
            { user_id: user.id, state: payload, updated_at: new Date().toISOString() },
            { onConflict: "user_id" }
          );
      }, 1200);
    });

    const { data: authSub } = sb.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") {
        loadedRef.current = false;
        // Clear local Zustand state so the next user (or re-registered
        // user) starts clean instead of inheriting persisted XP/tasks.
        useStore.getState().resetData();
        router.push("/login");
      }
    });

    return () => {
      cancelled = true;
      if (pushTimerRef.current) clearTimeout(pushTimerRef.current);
      unsub();
      authSub.subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return null;
}
