"use client";

import React from "react";
import { DashboardWidget } from "../DashboardWidget";
import { useTranslation } from "@/lib/i18n";

interface IframeWidgetProps {
  editMode?: boolean;
  onRemove?: () => void;
  config?: {
    url?: string;
    title?: string;
    height?: number;
    allow?: string; // sandbox permissions
  };
}

export function IframeWidget({ editMode, onRemove, config = {} }: IframeWidgetProps) {
  const { t } = useTranslation("dashboard");
  const { url, title = "Embedded Content", height = 320 } = config || {};

  if (!url) {
    return (
      <DashboardWidget
        title={title}
        description={t("widgets.custom_iframe.description") || "Custom embed"}
        editMode={editMode}
        onRemove={onRemove}
        isEmpty
        emptyMessage="No URL configured. Edit this element to add an iframe URL."
      >
        <div className="text-xs text-gray-500">Use the + button → Custom Embed to configure.</div>
      </DashboardWidget>
    );
  }

  return (
    <DashboardWidget
      title={title}
      description="Iframe embed"
      editMode={editMode}
      onRemove={onRemove}
      className="overflow-hidden"
    >
      <div className="w-full" style={{ height: `${height}px` }}>
        <iframe
          src={url}
          className="w-full h-full rounded border border-gray-200"
          allow={config.allow || "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"}
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
          title={title}
        />
      </div>
      {editMode && (
        <div className="mt-1 text-[10px] text-gray-400">Resize the widget to adjust embed height. Edit via widget menu (future) or re-add.</div>
      )}
    </DashboardWidget>
  );
}
