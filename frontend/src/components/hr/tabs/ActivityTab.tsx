"use client";
import { useTranslation } from "next-i18next";
import { useState } from "react";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

export function ActivityTab({ workerId }: { workerId: string }) {
  const { t } = useTranslation("hr");
  const [page, setPage] = useState(1);
  const { data } = useSWR(`/api/hr/workers/${workerId}/activity?page=${page}`, fetcher);
  const activities: any[] = data?.activities ?? [];
  return (
    <div className="space-y-3">
      {!activities.length && <p className="text-center text-sm text-muted-foreground py-10">{t("activity.noActivity")}</p>}
      <div className="space-y-2">
        {activities.map((a) => (
          <div key={a.id} className="flex items-start gap-3 text-sm border-b pb-2">
            <div className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" />
            <div className="flex-1">
              <p>{a.description}</p>
              <p className="text-xs text-muted-foreground">{a.user?.name ? `${t("activity.changedBy")} ${a.user.name} · ` : ""}{format(new Date(a.createdAt), "dd/MM/yyyy HH:mm")}</p>
            </div>
          </div>
        ))}
      </div>
      {data && page < data.pages && (
        <Button variant="outline" size="sm" className="w-full" onClick={() => setPage((p) => p + 1)}>{t("activity.loadMore")}</Button>
      )}
    </div>
  );
}