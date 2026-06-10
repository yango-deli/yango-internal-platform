"use client";

import React from "react";
import { useTranslation } from "@/lib/i18n";
import { WIDGET_DEFINITIONS, WidgetKey } from "@/types/dashboard";
import { Role } from "@prisma/client";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AddWidgetPanelProps {
  open: boolean;
  onClose: () => void;
  currentKeys: WidgetKey[];
  userRole: Role;
  onAdd: (key: WidgetKey) => void;
}

export function AddWidgetPanel({ open, onClose, currentKeys, userRole, onAdd }: AddWidgetPanelProps) {
  const { t } = useTranslation("dashboard");

  if (!open) return null;

  const available = WIDGET_DEFINITIONS.filter((w) =>
    w.roles.includes(userRole as any) && !currentKeys.includes(w.key)
  );

  return (
    <div className="fixed inset-y-0 right-0 rtl:left-0 rtl:right-auto z-40 w-80 border-l bg-white shadow-2xl p-4 overflow-auto" dir="inherit">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="font-semibold">{t("editMode.addPanel.title")}</div>
          <div className="text-xs text-gray-500">{t("editMode.addPanel.description")}</div>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="h-5 w-5" /></button>
      </div>

      <div className="space-y-2">
        {available.length === 0 && (
          <div className="text-sm text-gray-500">{t("editMode.addPanel.alreadyAdded")}</div>
        )}
        {available.map((w) => (
          <button
            key={w.key}
            onClick={() => onAdd(w.key)}
            className="w-full text-left rounded-lg border p-3 hover:bg-gray-50 active:bg-gray-100 transition"
          >
            <div className="font-medium text-sm">{t(w.titleKey)}</div>
            <div className="text-xs text-gray-500 mt-0.5">{t(w.descriptionKey)}</div>
          </button>
        ))}
      </div>

      <div className="mt-6 text-[10px] text-gray-400">{t("editMode.addPanel.available")}</div>
    </div>
  );
}
