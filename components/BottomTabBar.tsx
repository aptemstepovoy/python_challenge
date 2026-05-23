"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const items = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/tasks", label: "Tasks" },
  { href: "/review", label: "Review" },
];

export function BottomTabBar() {
  const pathname = usePathname();
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 flex border-t border-border bg-surface md:hidden">
      {items.map((item) => {
        const active =
          pathname === item.href || pathname?.startsWith(item.href + "/");
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex-1 py-3 text-center font-mono text-[11px] uppercase tracking-wider transition-colors",
              active
                ? "text-accent border-t-2 border-accent -mt-px"
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
