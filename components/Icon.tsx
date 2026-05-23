"use client";

import {
  Ban,
  BookOpen,
  Dumbbell,
  Footprints,
  HelpCircle,
  Languages,
  PenLine,
  Scale,
  Send,
  type LucideIcon,
  type LucideProps,
} from "lucide-react";

const MAP: Record<string, LucideIcon> = {
  Ban,
  BookOpen,
  Dumbbell,
  Footprints,
  Languages,
  PenLine,
  Scale,
  Send,
};

export function Icon({
  name,
  ...props
}: { name: string } & LucideProps) {
  const Cmp = MAP[name] ?? HelpCircle;
  return <Cmp {...props} />;
}
