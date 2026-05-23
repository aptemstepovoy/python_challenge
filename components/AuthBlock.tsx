"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { SUPABASE_ENABLED } from "@/lib/supabase/env";

export function AuthBlock() {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

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

  if (!SUPABASE_ENABLED) {
    return (
      <div className="font-mono text-[10px] uppercase tracking-wider text-secondary">
        Локальный режим
      </div>
    );
  }
  if (!email) return null;

  const signOut = async () => {
    setBusy(true);
    const sb = createClient();
    if (!sb) return;
    await sb.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <div className="space-y-1.5">
      <div className="font-mono text-[10px] uppercase tracking-wider text-secondary truncate">
        {email}
      </div>
      <button
        onClick={signOut}
        disabled={busy}
        className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-secondary hover:text-pink-bright transition-colors"
      >
        <LogOut className="h-3 w-3" />
        Выйти
      </button>
    </div>
  );
}
