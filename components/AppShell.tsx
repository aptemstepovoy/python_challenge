"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";
import { MobileTopBar } from "@/components/MobileTopBar";
import { QuickCapture } from "@/components/QuickCapture";
import { DailyIntro } from "@/components/DailyIntro";
import { AchievementToast } from "@/components/AchievementToast";
import { FocusTimer } from "@/components/FocusTimer";
import { IntroAnimation } from "@/components/IntroAnimation";
import { LevelUpToast } from "@/components/LevelUpToast";

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
      <DailyIntro />
      <AchievementToast />
      <LevelUpToast />
      <FocusTimer />
      <IntroAnimation />
    </>
  );
}
