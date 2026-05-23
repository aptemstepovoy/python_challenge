"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useStore } from "@/lib/store";
import { haptic } from "@/lib/haptics";
import { Download, Upload, AlertTriangle, CheckCircle2 } from "lucide-react";

const REQUIRED_KEYS = [
  "kgis",
  "tasks",
  "habits",
  "habitLogs",
  "reviews",
  "weightEntries",
  "xp",
  "achievements",
  "journals",
];

function fmtDate() {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

export function DataIO() {
  const [msg, setMsg] = useState<
    { kind: "ok" | "err"; text: string } | null
  >(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const onExport = () => {
    haptic("tap");
    const state = useStore.getState();
    const payload = {
      kgis: state.kgis,
      steps: state.steps,
      tasks: state.tasks,
      reviews: state.reviews,
      weightEntries: state.weightEntries,
      habits: state.habits,
      habitLogs: state.habitLogs,
      xp: state.xp,
      achievements: state.achievements,
      lastIntroDate: state.lastIntroDate,
      snoozesUsedDate: state.snoozesUsedDate,
      snoozesUsedCount: state.snoozesUsedCount,
      journals: state.journals,
      exportedAt: new Date().toISOString(),
      version: 6,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `operator-backup-${fmtDate()}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    setMsg({ kind: "ok", text: "Файл скачан" });
  };

  const onImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const data = JSON.parse(text);

      const missing = REQUIRED_KEYS.filter((k) => !(k in data));
      if (missing.length > 0) {
        setMsg({
          kind: "err",
          text: `Файл повреждён — нет полей: ${missing.join(", ")}`,
        });
        return;
      }

      if (
        !window.confirm(
          "Заменить текущие данные содержимым файла? Текущий прогресс будет потерян."
        )
      ) {
        if (fileRef.current) fileRef.current.value = "";
        return;
      }

      useStore.setState(data, false);
      haptic("success");
      setMsg({ kind: "ok", text: "Данные восстановлены — обнови страницу" });
    } catch (err) {
      setMsg({
        kind: "err",
        text: "Не удалось прочитать файл — это не JSON?",
      });
    } finally {
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <Card className="p-5 md:p-6">
      <h3 className="mb-2 display text-xl text-foreground">Резервная копия</h3>
      <p className="mb-4 text-sm text-secondary">
        Скачай JSON со всем прогрессом. Можно положить в облако и загрузить
        обратно на другом устройстве.
      </p>
      <div className="flex flex-wrap gap-2">
        <Button onClick={onExport} variant="outline">
          <Download className="mr-1.5 h-4 w-4" />
          Экспорт JSON
        </Button>
        <Button
          onClick={() => fileRef.current?.click()}
          variant="outline"
        >
          <Upload className="mr-1.5 h-4 w-4" />
          Импорт JSON
        </Button>
        <input
          ref={fileRef}
          type="file"
          accept=".json,application/json"
          onChange={onImport}
          className="hidden"
        />
      </div>
      {msg && (
        <div
          className={
            "mt-3 flex items-center gap-2 rounded border px-3 py-2 text-sm " +
            (msg.kind === "ok"
              ? "border-ok/40 bg-ok/10 text-ok-bright"
              : "border-danger/40 bg-danger/10 text-danger-bright")
          }
        >
          {msg.kind === "ok" ? (
            <CheckCircle2 className="h-4 w-4" />
          ) : (
            <AlertTriangle className="h-4 w-4" />
          )}
          <span>{msg.text}</span>
        </div>
      )}
    </Card>
  );
}
