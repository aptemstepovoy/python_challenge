"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";
import { MobileTopBar } from "@/components/MobileTopBar";
import { QuickCapture } from "@/components/QuickCapture";
import { AchievementToast } from "@/components/AchievementToast";
import { FocusTimer } from "@/components/FocusTimer";
import { IntroAnimation } from "@/components/IntroAnimation";
import { LevelUpToast } from "@/components/LevelUpToast";
import { LootToast } from "@/components/LootToast";
import { LevelRewardsWatcher } from "@/components/LevelRewardsWatcher";
import { StreakFreezeAutomation } from "@/components/StreakFreezeAutomation";
import { RitualWatchers } from "@/components/RitualWatchers";
import { TalentTree } from "@/components/TalentTree";
import { Inventory } from "@/components/Inventory";
import { useUIStore } from "@/lib/ui-store";

function isAuthRoute(pathname: string | null): boolean {
  if (!pathname) return false;
  return (
    pathname.startsWith("/login") ||
    pathname.startsWith("/signup") ||
    pathname.startsWith("/auth")
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const bare = isAuthRoute(pathname);
  const talentsOpen = useUIStore((s) => s.talentsOpen);
  const setTalentsOpen = useUIStore((s) => s.setTalentsOpen);
  const inventoryOpen = useUIStore((s) => s.inventoryOpen);
  const setInventoryOpen = useUIStore((s) => s.setInventoryOpen);

  if (bare) {
    return <>{children}</>;
  }

  return (
    <>
      <div className="flex min-h-screen flex-col md:flex-row">
        <MobileTopBar />
        <Sidebar />
        <main className="flex-1 overflow-x-hidden pb-8">
          {children}
        </main>
      </div>
      <QuickCapture />
      <AchievementToast />
      <LootToast />
      <LevelUpToast />
      <LevelRewardsWatcher />
      <StreakFreezeAutomation />
      <RitualWatchers />
      <FocusTimer />
      <IntroAnimation />
      <TalentTree open={talentsOpen} onOpenChange={setTalentsOpen} />
      <Inventory open={inventoryOpen} onOpenChange={setInventoryOpen} />
    </>
  );
}
