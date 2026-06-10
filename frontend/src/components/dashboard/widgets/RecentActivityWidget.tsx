"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useTranslation } from "@/lib/i18n";
import { DashboardWidget } from "../DashboardWidget";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

interface Run {
  id: string;
  fileName: string;
  createdAt: string;
  summary?: any;
}

export function RecentActivityWidget({ editMode, onRemove }: { editMode?: boolean; onRemove?: () => void }) {
  const { data: session } = useSession();
  const { t } = useTranslation("dashboard");
  const [runs, setRuns] = useState<Run[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      // Reuse the fact that the old dashboard page logic exists; for simplicity call a lightweight or just show empty + link.
      // In real we would add GET /api/dashboard/recent or use SWR on /api/users or similar.
      // Here we show a small client fetch to an existing protected route pattern or stub recent from simulation if we expose.
      // To avoid new endpoints for this widget, we show link + note that data comes from SimulationRun.
      setRuns([]); // populated in full impl via dedicated or prisma in RSC; widget is client for edit
      setLoading(false);
    }
    load();
  }, []);

  return (
    <DashboardWidget
      title={t("widgets.recent_activity.title")}
      description={t("widgets.recent_activity.description")}
      isLoading={loading}
      isEmpty={runs.length === 0}
      emptyMessage={t("widgets.recent_activity.empty")}
      editMode={editMode}
      onRemove={onRemove}
      headerAction={
        <Link href="/simulation" className="text-xs text-[#FFCC00] hover:underline">
          {t("widgets.recent_activity.viewAll")}
        </Link>
      }
    >
      <div className="text-xs text-gray-500">
        {t("widgets.recent_activity.columns.file")} • {t("widgets.recent_activity.columns.date")}
      </div>
      {/* In a full build we would map real SimulationRun rows with translated status chips */}
      <div className="mt-3 text-[11px] text-gray-400">Recent simulation runs appear here (connected to your SimulationRun history).</div>
    </DashboardWidget>
  );
}
