"use client";

import { useEffect } from "react";
import { useStore } from "@/lib/store";

export function LevelRewardsWatcher() {
  const xp = useStore((s) => s.xp);
  const claim = useStore((s) => s.claimLevelRewards);

  useEffect(() => {
    claim();
  }, [xp, claim]);

  return null;
}
