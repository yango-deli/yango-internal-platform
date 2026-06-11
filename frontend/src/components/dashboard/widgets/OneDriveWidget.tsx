"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useTranslation } from "@/lib/i18n";
import { DashboardWidget } from "../DashboardWidget";
import { getMyRecentOneDriveFiles, type OneDriveFile } from "@/lib/graph";
import { ExternalLink } from "lucide-react";
import type { SupportedLanguage } from "@/types/dashboard";

export function OneDriveWidget({ editMode, onRemove }: { editMode?: boolean; onRemove?: () => void }) {
  const { data: session } = useSession();
  const { t } = useTranslation("dashboard");
  const lang = (typeof document !== "undefined" ? document.documentElement.lang : "he") as SupportedLanguage;

  const [files, setFiles] = useState<OneDriveFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const accessToken = session?.accessToken as string | undefined;

  const load = useCallback(async () => {
    if (!accessToken) { setLoading(false); return; }
    setLoading(true); setError(null);
    const res = await getMyRecentOneDriveFiles(accessToken, 6);
    if ((res as any).error) {
      setError("Could not load OneDrive files");
    } else {
      setFiles((res as any).data || []);
    }
    setLoading(false);
  }, [accessToken]);

  useEffect(() => { load(); }, [load]);

  if (!accessToken) {
    return (
      <DashboardWidget
        title="OneDrive"
        description="Recent files from Microsoft 365"
        editMode={editMode} onRemove={onRemove}
        isEmpty
        emptyMessage="Connect Microsoft account to see OneDrive"
      >
        <a href="/api/auth/signin/azure-ad" className="text-xs font-medium text-[#FFCC00] hover:underline">
          Connect Microsoft
        </a>
      </DashboardWidget>
    );
  }

  return (
    <DashboardWidget
      title="OneDrive"
      description="Recent files (auto-synced via Entra SSO)"
      isLoading={loading} error={error} onRetry={load}
      isEmpty={files.length === 0}
      emptyMessage="No recent files"
      editMode={editMode} onRemove={onRemove}
    >
      <div className="space-y-1 text-sm">
        {files.map((f) => (
          <a
            key={f.id}
            href={f.webUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-between gap-2 rounded border border-gray-100 p-1.5 hover:bg-gray-50"
          >
            <span className="truncate">{f.name}</span>
            <ExternalLink className="h-3 w-3 flex-shrink-0 text-gray-400" />
          </a>
        ))}
      </div>
      <div className="mt-2 text-[10px] text-gray-400">Auto-integrated • no extra login</div>
    </DashboardWidget>
  );
}
