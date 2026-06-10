"use client";

import { AlertTriangle } from "lucide-react";
import { useI18n } from "@/components/providers/i18n-provider";
import { Button } from "@/components/ui/button";

export function DuplicateWarningBanner({
  onOverride,
}: {
  onOverride?: () => void;
}) {
  const { t } = useI18n();

  return (
    <div className="flex items-start gap-3 p-3 rounded-lg bg-amber-50 border border-amber-200">
      <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
      <div className="flex-1">
        <p className="text-sm font-medium text-amber-900">
          {t("modal.duplicateWarningTitle")}
        </p>
        <p className="text-xs text-amber-700 mt-0.5">
          {t("modal.duplicateWarningBody")}
        </p>
        {onOverride && (
          <Button
            size="sm"
            variant="outline"
            className="mt-2"
            onClick={onOverride}
          >
            {t("modal.overrideDuplicate")}
          </Button>
        )}
      </div>
    </div>
  );
}
