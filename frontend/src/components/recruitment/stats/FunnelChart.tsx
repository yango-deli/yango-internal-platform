"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useI18n } from "@/components/providers/i18n-provider";

export function FunnelChart({
  data,
}: {
  data: { stage: string; count: number }[];
}) {
  const { t } = useI18n();
  const chartData = data.map((d) => ({
    name: t(`stages.${d.stage}`),
    count: d.count,
  }));

  return (
    <div className="h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} layout="vertical" margin={{ left: 20 }}>
          <XAxis type="number" />
          <YAxis type="category" dataKey="name" width={140} tick={{ fontSize: 11 }} />
          <Tooltip />
          <Bar dataKey="count" fill="#FFCC00" radius={4} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
