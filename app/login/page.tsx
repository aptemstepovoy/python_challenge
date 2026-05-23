"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { SUPABASE_ENABLED } from "@/lib/supabase/env";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { AlertTriangle, CheckCircle2 } from "lucide-react";

type Mode = "login" | "signup";

function LoginInner() {
  const router = useRouter();
  const search = useSearchParams();
  const next = search.get("next") ?? "/today";
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<
    { kind: "ok" | "err"; text: string } | null
  >(null);

  if (!SUPABASE_ENABLED) {
    return (
      <Card className="p-6 space-y-3">
        <h1 className="display text-2xl text-foreground">Облачная синхронизация выключена</h1>
        <p className="text-base text-secondary">
          В Vercel не настроены переменные окружения{" "}
          <code className="text-accent-bright">NEXT_PUBLIC_SUPABASE_URL</code> и{" "}
          <code className="text-accent-bright">NEXT_PUBLIC_SUPABASE_ANON_KEY</code>.
          Приложение работает только локально (localStorage).
        </p>
        <Button onClick={() => router.push("/today")}>Открыть Today</Button>
      </Card>
    );
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) return;
    setBusy(true);
    setMsg(null);
    try {
      const sb = createClient();
      if (!sb) throw new Error("Supabase client unavailable");
      if (mode === "login") {
        const { error } = await sb.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (error) throw error;
        setMsg({ kind: "ok", text: "Вход выполнен — переход…" });
        router.push(next);
        router.refresh();
      } else {
        const { data, error } = await sb.auth.signUp({
          email: email.trim(),
          password,
        });
        if (error) throw error;
        if (data.user && !data.session) {
          setMsg({
            kind: "ok",
            text:
              "Подтверди email по ссылке из письма, потом войди. " +
              "Если хочешь без подтверждений — в Supabase: Authentication → " +
              "Providers → Email → отключи Confirm email.",
          });
        } else {
          setMsg({ kind: "ok", text: "Аккаунт создан — переход…" });
          router.push(next);
          router.refresh();
        }
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Не удалось выполнить вход";
      setMsg({ kind: "err", text: message });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card className="p-6 space-y-5">
      <div>
        <h1 className="display text-3xl text-foreground text-glow">
          OPERATOR
        </h1>
        <p className="mt-1 text-base text-secondary">
          {mode === "login" ? "Войди в свой профиль" : "Создай новый профиль"}
        </p>
      </div>

      <div className="flex gap-1 rounded-md border border-border bg-surface-2 p-1">
        <button
          type="button"
          onClick={() => setMode("login")}
          className={
            "flex-1 rounded px-3 py-2 text-sm transition-colors " +
            (mode === "login"
              ? "bg-gradient-to-br from-violet to-pink text-white"
              : "text-secondary hover:text-foreground")
          }
        >
          Вход
        </button>
        <button
          type="button"
          onClick={() => setMode("signup")}
          className={
            "flex-1 rounded px-3 py-2 text-sm transition-colors " +
            (mode === "signup"
              ? "bg-gradient-to-br from-violet to-pink text-white"
              : "text-secondary hover:text-foreground")
          }
        >
          Регистрация
        </button>
      </div>

      <form onSubmit={submit} className="space-y-4">
        <div className="space-y-1.5">
          <Label>Email</Label>
          <Input
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoFocus
          />
        </div>
        <div className="space-y-1.5">
          <Label>Пароль</Label>
          <Input
            type="password"
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />
        </div>
        {msg && (
          <div
            className={
              "flex items-start gap-2 rounded border px-3 py-2 text-sm " +
              (msg.kind === "ok"
                ? "border-ok/40 bg-ok/10 text-ok-bright"
                : "border-danger/40 bg-danger/10 text-danger-bright")
            }
          >
            {msg.kind === "ok" ? (
              <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" />
            ) : (
              <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
            )}
            <span>{msg.text}</span>
          </div>
        )}
        <Button type="submit" className="w-full" disabled={busy}>
          {busy
            ? "…"
            : mode === "login"
              ? "Войти"
              : "Создать аккаунт"}
        </Button>
      </form>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Suspense fallback={null}>
          <LoginInner />
        </Suspense>
      </div>
    </div>
  );
}
