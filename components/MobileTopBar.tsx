"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { User } from "lucide-react";
import { daysSinceAccountStart } from "@/lib/utils";
import { useStore } from "@/lib/store";
import { UserMenu } from "@/components/UserMenu";

export function MobileTopBar() {
  const [now, setNow] = useState<Date | null>(null);
  const accountStartDate = useStore((s) => s.accountStartDate);

  useEffect(() => {
    setNow(new Date());
    const t = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(t);
  }, []);

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between border-b border-border bg-background px-4 py-3 md:hidden">
      <Link
        href="/today"
        className="text-base font-semibold tracking-tight text-foreground"
      >
        OPERATOR
      </Link>
      <div className="flex items-center gap-3 text-[12px] num text-muted">
        {now && (
          <span>День {daysSinceAccountStart(accountStartDate, now)}</span>
        )}
        <UserMenu
          trigger={
            <button
              aria-label="menu"
              className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/20 text-accent-bright hover:bg-accent/30 transition-colors"
            >
              <User className="h-4 w-4" />
            </button>
          }
        />
      </div>
    </header>
  );
}
