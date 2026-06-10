"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useTranslation } from "@/lib/i18n";
import { DashboardWidget } from "../DashboardWidget";
import { formatRelativeTime } from "@/lib/i18n";
import { getMyEmails, type OutlookMessage } from "@/lib/graph";
import { ExternalLink } from "lucide-react";
import type { SupportedLanguage } from "@/types/dashboard";

export function OutlookMailWidget({ editMode, onRemove }: { editMode?: boolean; onRemove?: () => void }) {
  const { data: session } = useSession();
  const { t } = useTranslation("dashboard");
  const lang = (typeof document !== "undefined" ? document.documentElement.lang : "he") as SupportedLanguage;

  const [emails, setEmails] = useState<OutlookMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [unread, setUnread] = useState(0);

  const accessToken = session?.accessToken as string | undefined;

  const load = useCallback(async () => {
    if (!accessToken) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    const res = await getMyEmails(accessToken, 5);
    if (res.error) {
      setError(t("widgets.outlook_mail.error"));
    } else if (res.data) {
      setEmails(res.data.value || []);
      const u = (res.data.value || []).filter((e) => !e.isRead).length;
      setUnread(u);
    }
    setLoading(false);
  }, [accessToken, t]);

  useEffect(() => {
    load();
  }, [load]);

  if (!accessToken) {
    return (
      <DashboardWidget
        title={t("widgets.outlook_mail.title")}
        description={t("widgets.outlook_mail.description")}
        editMode={editMode}
        onRemove={onRemove}
        isEmpty
        emptyMessage={t("connect.outlook")}
      >
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            // In real app would trigger re-auth with incremental consent; for now just reload login flow hint
            window.location.href = "/api/auth/signin/azure-ad";
          }}
          className="inline-flex items-center text-xs font-medium text-[#FFCC00] hover:underline"
        >
          {t("widgets.outlook_mail.connectCta")} →
        </a>
      </DashboardWidget>
    );
  }

  const headerAction = unread > 0 ? (
    <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-medium text-red-600">
      {t("widgets.outlook_mail.unread", { count: unread })}
    </span>
  ) : null;

  return (
    <DashboardWidget
      title={t("widgets.outlook_mail.title")}
      description={t("widgets.outlook_mail.description")}
      isLoading={loading}
      error={error}
      onRetry={load}
      isEmpty={emails.length === 0}
      emptyMessage={t("widgets.outlook_mail.empty")}
      headerAction={headerAction}
      editMode={editMode}
      onRemove={onRemove}
    >
      <div className="space-y-2 text-sm">
        {emails.map((m) => (
          <a
            key={m.id}
            href={m.webLink || "#"}
            target="_blank"
            rel="noreferrer"
            className="block rounded-lg border border-gray-100 p-2 hover:bg-gray-50 rtl:text-right"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <div className="font-medium text-gray-900 truncate">
                  {m.from?.emailAddress?.name || m.from?.emailAddress?.address || "Unknown"}
                </div>
                <div className="text-xs text-gray-600 truncate">{m.subject}</div>
                <div className="mt-0.5 text-[11px] text-gray-500 line-clamp-2">{m.bodyPreview}</div>
              </div>
              <div className="flex flex-col items-end text-[10px] text-gray-400 whitespace-nowrap">
                <span>{formatRelativeTime(m.receivedDateTime, lang)}</span>
                <ExternalLink className="mt-0.5 h-3 w-3" />
              </div>
            </div>
          </a>
        ))}
      </div>
    </DashboardWidget>
  );
}
