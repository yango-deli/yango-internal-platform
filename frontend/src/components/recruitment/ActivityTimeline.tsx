"use client";

import { useI18n } from "@/components/providers/i18n-provider";
import { formatDate, translateActivity } from "@/lib/recruitment/format";

export function ActivityTimeline({
  activities,
}: {
  activities: Array<{
    id: string;
    description: string;
    metadata?: Record<string, unknown> | null;
    createdAt: string;
    user: { name: string | null };
  }>;
}) {
  const { t } = useI18n();

  if (!activities.length) {
    return (
      <p className="text-sm text-gray-400 text-center py-8">
        {t("panel.noActivity")}
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {activities.map((a) => (
        <div key={a.id} className="flex gap-3">
          <div className="w-2 h-2 rounded-full bg-[#FFCC00] mt-2 flex-shrink-0" />
          <div>
            <p className="text-sm text-gray-900">
              {translateActivity(a.description, t, a.metadata)}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              {a.user.name} · {formatDate(a.createdAt)}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
