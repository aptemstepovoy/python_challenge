"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import {
  User,
  LogOut,
  Sparkles,
  Trophy,
  Target,
  LineChart,
  Lightbulb,
  ScrollText,
  Sun,
  ListChecks,
  Repeat,
  Home,
  Snowflake,
  HelpCircle,
  Sparkle,
  Package,
  Moon,
  X,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { SUPABASE_ENABLED } from "@/lib/supabase/env";
import { cn } from "@/lib/utils";
import { useStore } from "@/lib/store";
import { levelFromXP, progressWithinLevel } from "@/lib/xp";
import { Progress } from "@/components/ui/progress";
import { CountUp } from "@/components/CountUp";
import { haptic } from "@/lib/haptics";
import { TalentTree } from "@/components/TalentTree";
import { Inventory } from "@/components/Inventory";
import { EveningRitual } from "@/components/EveningRitual";

function FreezeRow({ count }: { count: number }) {
  const [show, setShow] = useState(false);
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="flex items-center gap-1.5 text-foreground">
          <Snowflake className="h-3.5 w-3.5 text-cyan-bright" />
          Streak-заморозки
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              setShow((v) => !v);
            }}
            className="text-secondary hover:text-accent-bright"
            aria-label="Что такое заморозки"
          >
            <HelpCircle className="h-3.5 w-3.5" />
          </button>
        </span>
        <span className="num">
          <span className="text-cyan-bright">{count}</span>
          <span className="text-secondary"> / 3</span>
        </span>
      </div>
      {show && (
        <div className="rounded-md border border-border bg-surface-2 p-3 text-xs leading-relaxed text-secondary space-y-1.5">
          <div className="font-mono text-[10px] uppercase tracking-wider text-cyan-bright">
            Заморозки спасают streak
          </div>
          <p>
            Если пропустил день и не залогал ни одной daily-привычки — одна
            заморозка сжигается автоматически, и streak продолжается.
          </p>
          <p>
            <span className="text-foreground">Как зарабатывать:</span>{" "}
            +1 заморозка за каждые 7 идеальных дней подряд. Максимум 3 в запасе.
          </p>
        </div>
      )}
    </div>
  );
}

const PRIMARY = [
  { href: "/today", label: "Сегодня", icon: Home },
  { href: "/habits", label: "Привычки", icon: Repeat },
  { href: "/tasks", label: "Задачи", icon: ListChecks },
  { href: "/insights", label: "Инсайты", icon: Lightbulb },
  { href: "/journal", label: "Отчёт за день", icon: ScrollText },
  { href: "/review", label: "Ревью недели", icon: Sun },
];

const SECONDARY = [
  { href: "/dashboard", label: "Обзор", icon: LineChart },
  { href: "/bosses", label: "Боссы", icon: Target },
  { href: "/achievements", label: "Достижения", icon: Trophy },
];

export function UserMenu({
  trigger,
}: {
  trigger: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const xp = useStore((s) => s.xp);
  const lvl = levelFromXP(xp);
  const lvlPct = progressWithinLevel(xp);
  const streakFreezes = useStore((s) => s.streakFreezes);
  const [eveningOpen, setEveningOpen] = useState(false);
  const [talentsOpen, setTalentsOpen] = useState(false);
  const [inventoryOpen, setInventoryOpen] = useState(false);
  const talentPoints = useStore((s) => s.talentPoints);
  const inventoryCount = useStore((s) => s.inventory.length);
  const [email, setEmail] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!SUPABASE_ENABLED) return;
    const sb = createClient();
    if (!sb) return;
    sb.auth.getUser().then(({ data }) => {
      setEmail(data.user?.email ?? null);
    });
    const { data: sub } = sb.auth.onAuthStateChange((_e, session) => {
      setEmail(session?.user?.email ?? null);
    });
    return () => {
      sub.subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    haptic("tap");
    if (!SUPABASE_ENABLED) return;
    const sb = createClient();
    if (!sb) return;
    await sb.auth.signOut();
    setOpen(false);
    router.push("/login");
    router.refresh();
  };

  const isActive = (href: string) =>
    pathname === href || pathname?.startsWith(href + "/");

  return (
    <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
      <DialogPrimitive.Trigger asChild>{trigger}</DialogPrimitive.Trigger>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/70 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content
          className={cn(
            "fixed z-50 panel-bright border-l border-border-bright p-5 overflow-y-auto",
            "right-0 top-0 h-full w-[88vw] max-w-sm",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right",
            "duration-200"
          )}
        >
          <DialogPrimitive.Title className="sr-only">Меню</DialogPrimitive.Title>
          <DialogPrimitive.Close className="absolute right-4 top-4 rounded text-secondary hover:text-foreground">
            <X className="h-5 w-5" />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>

          <div className="space-y-5 pt-2 pb-4">
            <div className="flex items-center gap-3 pr-8">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet to-pink text-white shadow-glow">
                <User className="h-6 w-6" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="display text-lg text-foreground text-glow-soft truncate">
                  {email ?? "Артём"}
                </div>
                <div className="font-mono text-[11px] uppercase tracking-wider text-secondary mt-0.5">
                  L{lvl.num} · {lvl.title} ·{" "}
                  <CountUp value={xp} duration={500} /> XP
                </div>
              </div>
            </div>

            <Progress value={lvlPct} tone="accent" />

            <div className="ornament" />

            <nav className="space-y-1">
              <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-secondary mb-2 px-2">
                Главное
              </div>
              {PRIMARY.map((l) => {
                const active = isActive(l.href);
                return (
                  <Link
                    key={l.href}
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2.5 text-base transition-colors",
                      active
                        ? "bg-surface-2 text-accent-bright border-l-2 border-accent pl-[10px]"
                        : "text-foreground hover:bg-surface-2 hover:text-accent-bright"
                    )}
                  >
                    <l.icon
                      className={cn(
                        "h-4 w-4",
                        active ? "text-accent-bright" : "text-accent-bright/70"
                      )}
                    />
                    {l.label}
                  </Link>
                );
              })}
            </nav>

            <div className="ornament" />

            <nav className="space-y-1">
              <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-secondary mb-2 px-2">
                Аналитика
              </div>
              {SECONDARY.map((l) => {
                const active = isActive(l.href);
                return (
                  <Link
                    key={l.href}
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2.5 text-base transition-colors",
                      active
                        ? "bg-surface-2 text-accent-bright border-l-2 border-accent pl-[10px]"
                        : "text-foreground hover:bg-surface-2 hover:text-accent-bright"
                    )}
                  >
                    <l.icon
                      className={cn(
                        "h-4 w-4",
                        active ? "text-accent-bright" : "text-accent-bright/70"
                      )}
                    />
                    {l.label}
                  </Link>
                );
              })}
            </nav>

            <div className="ornament" />

            <div className="space-y-2">
              <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-secondary px-2">
                Прогресс
              </div>

              <button
                onClick={() => {
                  setOpen(false);
                  setTimeout(() => setTalentsOpen(true), 200);
                }}
                className={cn(
                  "flex w-full items-center justify-between rounded-md px-3 py-2.5 text-base transition-colors",
                  "text-foreground hover:bg-surface-2 hover:text-accent-bright"
                )}
              >
                <span className="flex items-center gap-3">
                  <Sparkle className="h-4 w-4 text-accent-bright/70" />
                  Таланты
                </span>
                {talentPoints > 0 && (
                  <span className="flex items-center gap-1 rounded-full bg-accent/20 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-accent-bright">
                    +{talentPoints}
                  </span>
                )}
              </button>

              <button
                onClick={() => {
                  setOpen(false);
                  setTimeout(() => setInventoryOpen(true), 200);
                }}
                className={cn(
                  "flex w-full items-center justify-between rounded-md px-3 py-2.5 text-base transition-colors",
                  "text-foreground hover:bg-surface-2 hover:text-accent-bright"
                )}
              >
                <span className="flex items-center gap-3">
                  <Package className="h-4 w-4 text-accent-bright/70" />
                  Инвентарь
                </span>
                {inventoryCount > 0 && (
                  <span className="font-mono text-[10px] uppercase tracking-wider text-secondary num">
                    {inventoryCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => {
                  setOpen(false);
                  setTimeout(() => setEveningOpen(true), 200);
                }}
                className={cn(
                  "flex w-full items-center justify-between rounded-md px-3 py-2.5 text-base transition-colors",
                  "text-foreground hover:bg-surface-2 hover:text-accent-bright"
                )}
              >
                <span className="flex items-center gap-3">
                  <Moon className="h-4 w-4 text-accent-bright/70" />
                  Завершить день
                </span>
              </button>

              <div className="px-2 pt-1">
                <FreezeRow count={streakFreezes} />
              </div>
            </div>

            {SUPABASE_ENABLED ? (
              <button
                onClick={signOut}
                className="flex w-full items-center gap-3 rounded-md border border-danger/40 bg-danger/5 px-3 py-2.5 text-base text-danger-bright hover:bg-danger/15 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Выйти
              </button>
            ) : (
              <div className="rounded-md border border-border bg-surface-2 px-3 py-2.5 text-sm text-secondary">
                Локальный режим (без облака)
              </div>
            )}
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
      <EveningRitual open={eveningOpen} onOpenChange={setEveningOpen} />
      <TalentTree open={talentsOpen} onOpenChange={setTalentsOpen} />
      <Inventory open={inventoryOpen} onOpenChange={setInventoryOpen} />
    </DialogPrimitive.Root>
  );
}
