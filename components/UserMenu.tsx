"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
  X,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { SUPABASE_ENABLED } from "@/lib/supabase/env";
import { cn } from "@/lib/utils";
import { useStore } from "@/lib/store";
import { levelFromXP } from "@/lib/xp";
import { haptic } from "@/lib/haptics";

const LINKS = [
  { href: "/dashboard", label: "Обзор", icon: LineChart },
  { href: "/bosses", label: "Боссы", icon: Target },
  { href: "/achievements", label: "Достижения", icon: Trophy },
  { href: "/insights", label: "Инсайты", icon: Lightbulb },
  { href: "/journal", label: "Отчёт за день", icon: ScrollText },
  { href: "/review", label: "Ревью недели", icon: Sparkles },
];

export function UserMenu({
  trigger,
}: {
  trigger: React.ReactNode;
}) {
  const router = useRouter();
  const xp = useStore((s) => s.xp);
  const lvl = levelFromXP(xp);
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

  return (
    <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
      <DialogPrimitive.Trigger asChild>{trigger}</DialogPrimitive.Trigger>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/70 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content
          className={cn(
            "fixed z-50 panel-bright border-l border-border-bright p-5",
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

          <div className="space-y-6 pt-2">
            <div className="flex items-center gap-3 pr-8">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet to-pink text-white shadow-glow">
                <User className="h-6 w-6" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="display text-lg text-foreground text-glow-soft truncate">
                  {email ?? "Артём"}
                </div>
                <div className="font-mono text-[11px] uppercase tracking-wider text-secondary mt-0.5">
                  L{lvl.num} · {lvl.title} · {xp} XP
                </div>
              </div>
            </div>

            <div className="ornament" />

            <nav className="space-y-1">
              <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-secondary mb-2 px-2">
                Разделы
              </div>
              {LINKS.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 rounded-md px-3 py-2.5 text-base text-foreground hover:bg-surface-2 hover:text-accent-bright transition-colors"
                >
                  <l.icon className="h-4 w-4 text-accent-bright/80" />
                  {l.label}
                </Link>
              ))}
            </nav>

            <div className="ornament" />

            <div className="space-y-2">
              <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-secondary px-2">
                Настройки
              </div>
              <div className="px-3 py-2 text-sm text-secondary">
                Тема — тёмная (другие будут в v5)
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
    </DialogPrimitive.Root>
  );
}
