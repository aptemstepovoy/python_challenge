"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { cn, daysSinceStart, formatWeekday } from "@/lib/utils";

const items = [
  { href: "/today", label: "Today" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/tasks", label: "Tasks" },
  { href: "/review", label: "Review" },
];

export function Sidebar() {
  const pathname = usePathname();
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const t = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(t);
  }, []);

  return (
    <aside className="hidden w-60 shrink-0 flex-col justify-between border-r border-border bg-surface px-5 py-6 md:flex">
      <div>
        <div className="mb-1 font-mono text-lg tracking-[0.2em] text-foreground">
          OPERATOR
        </div>
        <div className="mb-10 text-xs leading-snug text-muted">
          К свободе через систему
        </div>

        <nav className="flex flex-col gap-1">
          {items.map((item) => {
            const active = pathname === item.href || pathname?.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded px-3 py-2 font-mono text-sm uppercase tracking-wider transition-colors",
                  active
                    ? "bg-surface-2 text-accent border-l-2 border-accent pl-[10px]"
                    : "text-muted hover:bg-surface-2 hover:text-foreground"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="border-t border-border pt-4 text-xs text-muted">
        {now ? (
          <>
            <div className="font-mono uppercase tracking-wider">
              {formatWeekday(now)}
            </div>
            <div className="mt-1 num text-foreground">
              День {daysSinceStart(now)} / 365
            </div>
          </>
        ) : (
          <div className="font-mono uppercase tracking-wider opacity-0">.</div>
        )}
      </div>
    </aside>
  );
}
