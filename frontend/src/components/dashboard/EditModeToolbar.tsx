"use client";

import React from "react";
import { useTranslation } from "@/lib/i18n";
import { Button } from "@/components/ui/button";

export function EditModeToolbar({ onExit }: { onExit: () => void }) {
  const { t } = useTranslation("dashboard");
  return (
    <div className="mb-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-sm flex items-center justify-between">
      <span>{t("editMode.toolbar")}</span>
      <Button size="sm" onClick={onExit}>{t("page.exitEditMode")}</Button>
    </div>
  );
}
