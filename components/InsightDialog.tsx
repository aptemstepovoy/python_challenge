"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { VoiceInput } from "@/components/VoiceInput";
import { useStore } from "@/lib/store";
import { haptic } from "@/lib/haptics";

const todayISO = () => new Date().toISOString().slice(0, 10);

export function InsightDialog({
  open,
  onOpenChange,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onSaved?: () => void;
}) {
  const addInsight = useStore((s) => s.addInsight);
  const [text, setText] = useState("");
  const [usedVoice, setUsedVoice] = useState(false);

  const save = () => {
    if (!text.trim()) return;
    haptic("success");
    addInsight({
      date: todayISO(),
      text: text.trim(),
      source: usedVoice ? "voice" : "text",
    });
    setText("");
    setUsedVoice(false);
    onOpenChange(false);
    onSaved?.();
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) {
          setText("");
          setUsedVoice(false);
        }
        onOpenChange(o);
      }}
    >
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Записать инсайт</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <Label>Мысль, идея, наблюдение</Label>
          <div className="flex gap-2">
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              autoFocus
              rows={5}
              placeholder="что зацепило, что нужно запомнить…"
              className="flex-1"
            />
            <VoiceInput
              onAppend={(chunk) => {
                setUsedVoice(true);
                setText((prev) =>
                  prev ? `${prev.trimEnd()} ${chunk}` : chunk
                );
              }}
            />
          </div>
          <div className="text-[11px] text-secondary">
            Вся история — на /insights
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Отмена
          </Button>
          <Button onClick={save}>Сохранить</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
