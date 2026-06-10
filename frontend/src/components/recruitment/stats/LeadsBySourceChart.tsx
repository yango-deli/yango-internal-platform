"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useI18n } from "@/components/providers/i18n-provider";

const COLORS = ["#FFCC00", "#3B82F6", "#10B981", "#F59E0B"];

export function LeadsBySourceChart({
  data,
}: {
  data: { week: string; sources: Record<string, number> }[];
}) {
  const { t } = useI18n();
  const sources = ["website", "facebook", "manual", "referral"];

  const chartData = data.map((d) => {
    const row: Record<string, string | number> = { week: d.week };
    for (const s of sources) {
      row[s] = d.sources[s] ?? 0;
    }
    return row;
  });

  return (
    <div className="h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData}>
          <XAxis dataKey="week" tick={{ fontSize: 10 }} />
          <YAxis />
          <Tooltip />
          <Legend formatter={(v) => t(`sources.${v}`)} />
          {sources.map((s, i) => (
            <Bar key={s} dataKey={s} fill={COLORS[i % COLORS.length]} stackId="a" />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
