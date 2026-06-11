"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useTranslation } from "@/lib/i18n";
import { DashboardWidget } from "../DashboardWidget";
import { getMyPlannerTasks, updatePlannerTaskProgress, type PlannerTask } from "@/lib/graph";
import { CheckCircle, Plus } from "lucide-react";
import type { SupportedLanguage } from "@/types/dashboard";

export function PlannerWidget({ editMode, onRemove }: { editMode?: boolean; onRemove?: () => void }) {
  const { data: session } = useSession();
  const { t } = useTranslation("dashboard");
  const lang = (typeof document !== "undefined" ? document.documentElement.lang : "he") as SupportedLanguage;

  const [tasks, setTasks] = useState<PlannerTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const accessToken = session?.accessToken as string | undefined;

  const load = useCallback(async () => {
    if (!accessToken) { setLoading(false); return; }
    setLoading(true); setError(null);
    const res = await getMyPlannerTasks(accessToken, 10);
    if ((res as any).error) {
      setError(t("widgets.ms_planner.error") || "Could not load Planner tasks");
    } else {
      setTasks((res as any).data || []);
    }
    setLoading(false);
  }, [accessToken, t]);

  useEffect(() => { load(); }, [load]);

  async function markDone(task: PlannerTask) {
    if (!accessToken) return;
    setTasks(prev => prev.map(t => t.id === task.id ? { ...t, percentComplete: 100 } : t));
    await updatePlannerTaskProgress(accessToken, task.id, 100);
  }

  if (!accessToken) {
    return (
      <DashboardWidget
        title={t("widgets.ms_planner.title") || "Microsoft Planner"}
        description={t("widgets.ms_planner.description") || "Your Planner tasks"}
        editMode={editMode} onRemove={onRemove}
        isEmpty
        emptyMessage={t("connect.planner") || "Connect Microsoft to see Planner tasks"}
      >
        <a href="/api/auth/signin/azure-ad" className="text-xs font-medium text-[#FFCC00] hover:underline">
          {t("widgets.ms_planner.connectCta") || "Connect Planner"}
        </a>
      </DashboardWidget>
    );
  }

  return (
    <DashboardWidget
      title={t("widgets.ms_planner.title") || "Microsoft Planner"}
      description={t("widgets.ms_planner.description") || "Tasks from your plans"}
      isLoading={loading} error={error} onRetry={load}
      isEmpty={tasks.length === 0}
      emptyMessage={t("widgets.ms_planner.empty") || "No Planner tasks assigned to you"}
      editMode={editMode} onRemove={onRemove}
    >
      <ul className="space-y-1 text-sm">
        {tasks.map((task) => {
          const done = (task.percentComplete ?? 0) >= 100;
          const due = task.dueDateTime ? new Date(task.dueDateTime) : null;
          const overdue = due && due < new Date() && !done;

          return (
            <li key={task.id} className="flex items-start gap-2 rounded border border-gray-100 p-1.5">
              <button
                onClick={() => markDone(task)}
                disabled={done}
                className="mt-0.5 text-green-600 hover:text-green-700 disabled:opacity-40"
              >
                <CheckCircle className="h-4 w-4" />
              </button>
              <div className="min-w-0 flex-1 rtl:text-right">
                <div className={done ? "line-through text-gray-500" : "text-gray-900"}>{task.title}</div>
                {task.planTitle && <div className="text-[10px] text-gray-500">{task.planTitle}</div>}
                {due && (
                  <div className={`text-[10px] ${overdue ? "text-red-600 font-medium" : "text-gray-500"}`}>
                    Due: {due.toLocaleDateString(lang === "he" ? "he-IL" : lang === "ru" ? "ru-RU" : "en-GB")}
                    {overdue && " (overdue)"}
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </DashboardWidget>
  );
}
