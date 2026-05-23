"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useStore } from "@/lib/store";
import { haptic } from "@/lib/haptics";
import { logsInWeek } from "@/lib/habits-logic";

const todayISO = () => new Date().toISOString().slice(0, 10);

export function ReviewForm({ onSubmitted }: { onSubmitted?: () => void }) {
  const addReview = useStore((s) => s.addReview);
  const habits = useStore((s) => s.habits);
  const habitLogs = useStore((s) => s.habitLogs);
  const reviews = useStore((s) => s.reviews);
  const weightEntries = useStore((s) => s.weightEntries);

  const defaults = useMemo(() => {
    const last = reviews[0];
    const lastWeight = weightEntries[weightEntries.length - 1];
    const content = habits.find((h) => h.name === "Контент");
    const english = habits.find((h) => h.name === "Английский");
    const outreach = habits.find((h) => h.name === "Outreach");

    const postsAuto = content
      ? logsInWeek(habitLogs, content.id).length
      : 0;
    const engHoursAuto = english
      ? Math.round(logsInWeek(habitLogs, english.id).length * 0.5 * 10) / 10
      : 0;
    const appsAuto = outreach
      ? logsInWeek(habitLogs, outreach.id).length
      : 0;

    return {
      weight: lastWeight ? String(lastWeight.weight_kg) : "",
      posts: postsAuto > 0 ? String(postsAuto) : last?.posts_published != null ? String(last.posts_published) : "",
      apps: appsAuto > 0 ? String(appsAuto) : last?.applications_sent != null ? String(last.applications_sent) : "",
      english: engHoursAuto > 0 ? String(engHoursAuto) : last?.english_hours != null ? String(last.english_hours) : "",
    };
  }, [reviews, habits, habitLogs, weightEntries]);

  const [date, setDate] = useState(todayISO());
  const [weight, setWeight] = useState(defaults.weight);
  const [posts, setPosts] = useState(defaults.posts);
  const [apps, setApps] = useState(defaults.apps);
  const [english, setEnglish] = useState(defaults.english);
  const [blockers, setBlockers] = useState("");
  const [wins, setWins] = useState("");

  const parseNum = (v: string): number | null => {
    if (v.trim() === "") return null;
    const n = Number(v);
    return Number.isNaN(n) ? null : n;
  };

  const submit = () => {
    haptic("success");
    addReview({
      date,
      weight_kg: parseNum(weight),
      posts_published: parseNum(posts),
      applications_sent: parseNum(apps),
      english_hours: parseNum(english),
      blockers,
      wins,
    });
    setWeight("");
    setPosts("");
    setApps("");
    setEnglish("");
    setBlockers("");
    setWins("");
    onSubmitted?.();
  };

  return (
    <Card className="p-5 md:p-6">
      <h3 className="mb-2 font-mono text-sm uppercase tracking-wider text-foreground">
        Новое ревью
      </h3>
      <p className="mb-5 text-[11px] text-muted">
        Поля предзаполнены из логов привычек и прошлого ревью — поправь если нужно
      </p>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-1.5">
          <Label>Дата</Label>
          <Input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label>Вес, кг</Label>
          <Input
            type="number"
            step="0.1"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label>Постов опубликовано</Label>
          <Input
            type="number"
            value={posts}
            onChange={(e) => setPosts(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label>Applications отправлено</Label>
          <Input
            type="number"
            value={apps}
            onChange={(e) => setApps(e.target.value)}
          />
        </div>
        <div className="space-y-1.5 col-span-2">
          <Label>Часов английского</Label>
          <Input
            type="number"
            step="0.5"
            value={english}
            onChange={(e) => setEnglish(e.target.value)}
          />
        </div>
        <div className="space-y-1.5 col-span-2">
          <Label>Что блокирует</Label>
          <Textarea
            value={blockers}
            onChange={(e) => setBlockers(e.target.value)}
          />
        </div>
        <div className="space-y-1.5 col-span-2">
          <Label>Что было хорошо</Label>
          <Textarea value={wins} onChange={(e) => setWins(e.target.value)} />
        </div>
      </div>
      <div className="mt-5 flex justify-end">
        <Button onClick={submit}>Сохранить ревью</Button>
      </div>
    </Card>
  );
}
