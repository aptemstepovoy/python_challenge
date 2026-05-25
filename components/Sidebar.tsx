"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { cn, daysSinceAccountStart, formatWeekday } from "@/lib/utils";
import { useStore } from "@/lib/store";
import { levelFromXP, progressWithinLevel } from "@/lib/xp";
import { CountUp } from "@/components/CountUp";
import { Progress } from "@/components/ui/progress";
import { UserMenu } from "@/components/UserMenu";
import { User } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { SUPABASE_ENABLED } from "@/lib/supabase/env";

const items = [
  { href: "/today", label: "Сегодня" },
  { href: "/dashboard", label: "Обзор" },
  { href: "/habits", label: "Привычки" },
  { href: "/tasks", label: "Задачи" },
  { href: "/insights", label: "Инсайты" },
  { href: "/bosses", label: "Боссы" },
  { href: "/achievements", label: "Достижения" },
  { href: "/journal", label: "Отчёт за день" },
  { href: "/review", label: "Ревью" },
];

export function Sidebar() {
  const pathname = usePathname();
  const [now, setNow] = useState<Date | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const xp = useStore((s) => s.xp);
  const accountStartDate = useStore((s) => s.accountStartDate);
  const lvl = levelFromXP(xp);
  const lvlPct = progressWithinLevel(xp);

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
    <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col justify-between self-start border-r border-border bg-panel px-5 py-6 md:flex">
      <div>
        <Link
          href="/today"
          className="display mb-1 block text-lg text-accent-bright text-glow tracking-[0.18em] hover:text-pink-bright transition-colors"
        >
          OPERATOR
        </Link>
        <Link
          href="/today"
          className="mb-6 block text-[11px] italic leading-snug text-muted hover:text-secondary transition-colors"
        >
          К свободе через систему
        </Link>
        <div className="ornament mb-6" />

        <nav className="flex flex-col gap-0.5">
          {items.map((item) => {
            const active = pathname === item.href || pathname?.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded px-3 py-2 font-mono text-[12px] uppercase tracking-[0.15em] transition-colors",
                  active
                    ? "bg-surface-2 text-accent-bright border-l-2 border-accent pl-[10px] text-glow-soft"
                    : "text-muted hover:bg-surface-2 hover:text-accent-bright"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="space-y-3 border-t border-border pt-4 text-xs text-muted">
        <div className="space-y-1.5">
          <div className="flex items-baseline justify-between">
            <span className="font-mono uppercase tracking-wider">
              L{lvl.num} · {lvl.title}
            </span>
            <span className="num text-foreground">
              <CountUp value={xp} duration={500} /> XP
            </span>
          </div>
          <Progress value={lvlPct} tone="accent" />
        </div>
        {now ? (
          <div>
            <div className="font-mono uppercase tracking-wider">
              {formatWeekday(now)}
            </div>
            <div className="mt-1 num text-foreground">
              День {daysSinceAccountStart(accountStartDate, now)} / 365
            </div>
          </div>
        ) : (
          <div className="font-mono uppercase tracking-wider opacity-0">.</div>
        )}
        <UserMenu
          trigger={
            <button className="flex w-full items-center gap-2 rounded-md border border-border-bright bg-surface-2/40 px-3 py-2 hover:border-accent transition-colors text-left">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet to-pink text-white">
                <User className="h-3.5 w-3.5" />
              </span>
              <span className="flex-1 min-w-0">
                <span className="block font-mono text-[10px] uppercase tracking-wider text-secondary truncate">
                  {email ?? (SUPABASE_ENABLED ? "Гость" : "Локальный")}
                </span>
                <span className="block font-mono text-[9px] uppercase tracking-wider text-secondary/70 mt-0.5">
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
