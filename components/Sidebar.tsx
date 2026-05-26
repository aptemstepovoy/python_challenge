"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { cn, daysSinceAccountStart, formatWeekday } from "@/lib/utils";
import { useStore } from "@/lib/store";
import { UserMenu } from "@/components/UserMenu";
import { User } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { SUPABASE_ENABLED } from "@/lib/supabase/env";

const items = [
  { href: "/today", label: "Сегодня" },
  { href: "/tasks", label: "План" },
  { href: "/habits", label: "Привычки" },
  { href: "/goals", label: "Цели" },
  { href: "/journal", label: "Журнал" },
];

export function Sidebar() {
  const pathname = usePathname();
  const [now, setNow] = useState<Date | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const accountStartDate = useStore((s) => s.accountStartDate);
  const vision = useStore((s) => s.vision);

  useEffect(() => {
    setNow(new Date());
    const t = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (!SUPABASE_ENABLED) return;
    const sb = createClient();
    if (!sb) return;
    sb.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? null));
    const { data: sub } = sb.auth.onAuthStateChange((_e, session) => {
      setEmail(session?.user?.email ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  return (
    <aside className="sticky top-0 hidden h-screen w-56 shrink-0 flex-col justify-between self-start border-r border-border bg-background px-5 py-6 md:flex">
      <div>
        <Link
          href="/today"
          className="mb-1 block text-base font-semibold text-accent-bright tracking-tight hover:text-accent transition-colors"
        >
          OPERATOR
        </Link>
        <Link
          href="/goals"
          className="mb-6 block text-[12px] leading-snug text-muted hover:text-secondary transition-colors line-clamp-2"
        >
          {vision}
        </Link>

        <nav className="flex flex-col gap-0.5">
          {items.map((item) => {
            const active =
              pathname === item.href || pathname?.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded px-3 py-2 text-[13px] transition-colors",
                  active
                    ? "bg-surface-2 text-foreground"
                    : "text-secondary hover:bg-surface-2/60 hover:text-foreground"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="space-y-3 border-t border-border pt-4 text-xs text-muted">
        {now && (
          <div>
            <div className="text-[11px]">{formatWeekday(now)}</div>
            <div className="mt-1 num text-foreground">
              День {daysSinceAccountStart(accountStartDate, now)} / 365
            </div>
          </div>
        )}
        <UserMenu
          trigger={
            <button className="flex w-full items-center gap-2 rounded-md border border-border bg-surface px-3 py-2 hover:border-accent transition-colors text-left">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent/20 text-accent-bright">
                <User className="h-3.5 w-3.5" />
              </span>
              <span className="flex-1 min-w-0">
                <span className="block text-[12px] text-foreground truncate">
                  {email ?? (SUPABASE_ENABLED ? "Гость" : "Локальный")}
                </span>
                <span className="block text-[10px] text-muted mt-0.5">
                  меню →
                </span>
              </span>
            </button>
          }
        />
      </div>
    </aside>
  );
}
