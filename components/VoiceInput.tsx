"use client";

import { useEffect, useRef, useState } from "react";
import { Mic, MicOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { haptic } from "@/lib/haptics";

type SpeechRecognitionLike = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((e: SpeechRecognitionEventLike) => void) | null;
  onerror: ((e: { error?: string }) => void) | null;
  onend: (() => void) | null;
};

type SpeechRecognitionEventLike = {
  results: ArrayLike<{
    isFinal: boolean;
    0: { transcript: string };
  }>;
};

function getRecognizer(): SpeechRecognitionLike | null {
  if (typeof window === "undefined") return null;
  const Ctor =
    (window as unknown as { SpeechRecognition?: new () => SpeechRecognitionLike })
      .SpeechRecognition ||
    (
      window as unknown as {
        webkitSpeechRecognition?: new () => SpeechRecognitionLike;
      }
    ).webkitSpeechRecognition;
  if (!Ctor) return null;
  try {
    return new Ctor();
  } catch {
    return null;
  }
}

export function VoiceInput({
  onAppend,
  className,
}: {
  onAppend: (text: string) => void;
  className?: string;
}) {
  const [supported, setSupported] = useState(false);
  const [active, setActive] = useState(false);
  const recRef = useRef<SpeechRecognitionLike | null>(null);

  useEffect(() => {
    setSupported(!!getRecognizer());
  }, []);

  if (!supported) return null;

  const start = () => {
    const rec = getRecognizer();
    if (!rec) return;
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = "ru-RU";
    let lastFinalIdx = 0;
    rec.onresult = (e) => {
      let final = "";
      for (let i = lastFinalIdx; i < e.results.length; i++) {
        const r = e.results[i];
        if (r.isFinal) {
          final += r[0].transcript + " ";
          lastFinalIdx = i + 1;
        }
      }
      if (final) onAppend(final);
    };
    rec.onerror = () => {
      setActive(false);
    };
    rec.onend = () => {
      setActive(false);
    };
    try {
      rec.start();
      recRef.current = rec;
      setActive(true);
      haptic("tap");
    } catch {
      setActive(false);
    }
  };

  const stop = () => {
    recRef.current?.stop();
    setActive(false);
    haptic("tap");
  };

  return (
    <button
      type="button"
      onClick={active ? stop : start}
      aria-label={active ? "стоп запись" : "диктовать"}
      className={cn(
        "flex h-10 w-10 shrink-0 items-center justify-center rounded-md border transition-colors",
        active
          ? "border-pink-bright bg-pink/15 text-pink-bright animate-pulse"
          : "border-border-bright bg-surface-2/50 text-secondary hover:text-accent-bright hover:border-accent",
        className
      )}
      title={active ? "Записываю — нажми, чтобы остановить" : "Диктовать"}
    >
      {active ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
    </button>
  );
}
