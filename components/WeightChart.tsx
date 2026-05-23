"use client";

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { format, parseISO } from "date-fns";
import { weightTargets } from "@/lib/initial-data";
import { useStore } from "@/lib/store";

export function WeightChart() {
  const weightEntries = useStore((s) => s.weightEntries);

  const data = weightTargets.map((t) => {
    const match = weightEntries.find((e) => e.date === t.date);
    return {
      date: t.date,
      label: format(parseISO(t.date), "MMM yy"),
      plan: t.weight_kg,
      actual: match?.weight_kg ?? null,
    };
  });

  for (const e of weightEntries) {
    if (!data.find((d) => d.date === e.date)) {
      data.push({
        date: e.date,
        label: format(parseISO(e.date), "MMM yy"),
        plan: null as unknown as number,
        actual: e.weight_kg,
      });
    }
  }
  data.sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="#262626" strokeDasharray="2 4" />
          <XAxis
            dataKey="label"
            stroke="#8a8a8a"
            tick={{ fontFamily: "var(--font-jetbrains)", fontSize: 11 }}
          />
          <YAxis
            stroke="#8a8a8a"
            domain={["dataMin - 2", "dataMax + 2"]}
            tick={{ fontFamily: "var(--font-jetbrains)", fontSize: 11 }}
            unit=" кг"
            width={70}
          />
          <Tooltip
            contentStyle={{
              background: "#141414",
              border: "1px solid #262626",
              borderRadius: 4,
              fontFamily: "var(--font-jetbrains)",
              fontSize: 12,
            }}
            labelStyle={{ color: "#e5e5e5" }}
          />
          <Legend
            wrapperStyle={{
              fontFamily: "var(--font-jetbrains)",
              fontSize: 11,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
            }}
          />
          <Line
            type="monotone"
            dataKey="plan"
            name="План"
            stroke="#8a8a8a"
            strokeWidth={1.5}
            strokeDasharray="4 4"
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="actual"
            name="Факт"
            stroke="#d4a574"
            strokeWidth={2}
            dot={{ fill: "#d4a574", r: 3 }}
            connectNulls
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
