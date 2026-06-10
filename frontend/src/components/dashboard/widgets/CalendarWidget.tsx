"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useTranslation } from "@/lib/i18n";
import { DashboardWidget } from "../DashboardWidget";
import { getMyCalendarEvents, type CalendarEvent } from "@/lib/graph";
import { formatRelativeTime } from "@/lib/i18n";
import type { SupportedLanguage } from "@/types/dashboard";

const DAY_KEYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"] as const;

export function CalendarWidget({ editMode, onRemove }: { editMode?: boolean; onRemove?: () => void }) {
  const { data: session } = useSession();
  const { t } = useTranslation("dashboard");
  const lang = (typeof document !== "undefined" ? document.documentElement.lang : "he") as SupportedLanguage;

  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const accessToken = session?.accessToken as string | undefined;

  const load = useCallback(async () => {
    if (!accessToken) { setLoading(false); return; }
    setLoading(true); setError(null);
    const res = await getMyCalendarEvents(accessToken, 7);
    if (res.error) setError(t("widgets.outlook_calendar.error"));
    else setEvents(res.data?.value || []);
    setLoading(false);
  }, [accessToken, t]);

  useEffect(() => { load(); }, [load]);

  // Group by day for mini timeline
  const days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return d;
  });

  const eventsByDay = days.map((day) => {
    const dayStart = new Date(day.getFullYear(), day.getMonth(), day.getDate());
    const dayEnd = new Date(dayStart.getTime() + 86400000);
    return events.filter((ev) => {
      const s = new Date(ev.start.dateTime);
      return s >= dayStart && s < dayEnd;
    });
  });

  const dayLabels = DAY_KEYS.map((k, idx) => t(`common:calendar.days.${k}`) || ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][idx]);

  if (!accessToken) {
    return (
      <DashboardWidget title={t("widgets.outlook_calendar.title")} description={t("widgets.outlook_calendar.description")} editMode={editMode} onRemove={onRemove} isEmpty emptyMessage={t("connect.calendar")}>
        <a href="/api/auth/signin/azure-ad" className="text-xs font-medium text-[#FFCC00] hover:underline">{t("widgets.outlook_calendar.connectCta")}</a>
      </DashboardWidget>
    );
  }

  return (
    <DashboardWidget
      title={t("widgets.outlook_calendar.title")}
      description={t("widgets.outlook_calendar.description")}
      isLoading={loading} error={error} onRetry={load}
      editMode={editMode} onRemove={onRemove}
    >
      <div className="grid grid-cols-7 gap-1 text-center text-[10px]">
        {days.map((d, i) => {
          const isToday = i === 0;
          const dayEvents = eventsByDay[i];
          return (
            <div key={i} className="rounded border border-gray-100 p-1 min-h-[68px]">
              <div className={`text-[10px] font-medium ${isToday ? "text-[#FFCC00]" : "text-gray-500"}`}>
                {dayLabels[i]}
              </div>
              <div className="mt-0.5 text-[9px] text-gray-400">{d.getDate()}</div>
              {dayEvents.length > 0 ? (
                <div className="mt-1 space-y-0.5 text-left rtl:text-right">
                  {dayEvents.slice(0, 2).map((ev) => (
                    <a key={ev.id} href={ev.webLink || "#"} target="_blank" className="block truncate rounded bg-blue-50 px-1 py-0.5 text-[9px] text-blue-700 hover:bg-blue-100">
                      {ev.subject}
                    </a>
                  ))}
                  {dayEvents.length > 2 && <div className="text-[8px] text-gray-400">+{dayEvents.length - 2}</div>}
                </div>
              ) : (
                <div className="mt-2 text-[9px] text-gray-300">—</div>
              )}
            </div>
          );
        })}
      </div>
      <div className="mt-2 text-[10px] text-gray-500">{t("common:time.today")} label shown in yellow</div>
    </DashboardWidget>
  );
}
