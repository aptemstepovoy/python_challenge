"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const items = [
  { href: "/today", label: "Сегодня" },
  { href: "/habits", label: "Привычки" },
  { href: "/tasks", label: "Задачи" },
  { href: "/journal", label: "Отчёт" },
  { href: "/review", label: "Ревью" },
];

export function BottomTabBar() {
  const pathname = usePathname();
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 flex border-t border-border-bright bg-panel md:hidden"
      style={{ boxShadow: "0 -8px 24px -8px rgba(0,0,0,0.6), inset 0 1px 0 rgba(243,201,122,0.06)" }}
    >
      {items.map((item) => {
        const active =
          pathname === item.href || pathname?.startsWith(item.href + "/");
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex-1 py-3 text-center font-mono text-[10px] uppercase tracking-[0.18em] transition-colors",
              active
                ? "text-accent-bright border-t-2 border-accent -mt-px text-glow-soft"
                : "text-muted"
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
