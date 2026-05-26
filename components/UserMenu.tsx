"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import {
  User,
  LogOut,
  Home,
  ListChecks,
  Repeat,
  Target,
  ScrollText,
  Lightbulb,
  Moon,
  X,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { SUPABASE_ENABLED } from "@/lib/supabase/env";
import { cn } from "@/lib/utils";
import { haptic } from "@/lib/haptics";

const NAV = [
  { href: "/today", label: "Сегодня", icon: Home },
  { href: "/tasks", label: "План", icon: ListChecks },
  { href: "/habits", label: "Привычки", icon: Repeat },
  { href: "/goals", label: "Цели", icon: Target },
  { href: "/insights", label: "Инсайты", icon: Lightbulb },
  { href: "/journal", label: "Отчёт за день", icon: ScrollText },
];

export function UserMenu({ trigger }: { trigger: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [email, setEmail] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

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
            "fixed z-50 bg-surface-2 border-l border-border-bright p-5 overflow-y-auto",
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
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent/20 text-accent-bright">
                <User className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-base text-foreground truncate">
                  {email ?? "Локальный"}
                </div>
              </div>
            </div>

            <nav className="space-y-0.5">
              {NAV.map((l) => {
                const active = isActive(l.href);
                return (
                  <Link
                    key={l.href}
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2.5 text-[14px] transition-colors",
                      active
                        ? "bg-surface-3 text-foreground"
                        : "text-secondary hover:bg-surface-3 hover:text-foreground"
                    )}
                  >
                    <l.icon className="h-4 w-4" />
                    {l.label}
                  </Link>
                );
              })}
            </nav>

            <div className="border-t border-border pt-3">
              <button
                onClick={() => {
                  setOpen(false);
                  router.push("/journal");
                }}
                className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-[14px] text-secondary hover:bg-surface-3 hover:text-foreground transition-colors"
              >
                <Moon className="h-4 w-4" />
                Завершить день
              </button>
            </div>

            {SUPABASE_ENABLED ? (
              <button
                onClick={signOut}
                className="flex w-full items-center gap-3 rounded-md border border-danger/40 bg-danger/5 px-3 py-2.5 text-sm text-danger-bright hover:bg-danger/15 transition-colors"
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
