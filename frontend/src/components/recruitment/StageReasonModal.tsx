"use client";

import { useState } from "react";
import { useI18n } from "@/components/providers/i18n-provider";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import type { RecruitmentStage } from "@/types/recruitment";

export function StageReasonModal({
  open,
  stage,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  stage: RecruitmentStage;
  onConfirm: (reason: string) => void | Promise<void>;
  onCancel: () => void;
}) {
  const { t } = useI18n();
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onCancel()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("modal.stageReasonTitle")}</DialogTitle>
          <p className="text-sm text-gray-500">
            {t(`stages.${stage}`)}
          </p>
        </DialogHeader>
        <Textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder={t("modal.stageReasonPlaceholder")}
        />
        <div className="flex justify-end gap-2 mt-2">
          <Button variant="outline" onClick={onCancel}>
            {t("form.cancel")}
          </Button>
          <Button
            disabled={!reason.trim() || loading}
            onClick={async () => {
              setLoading(true);
              await onConfirm(reason.trim());
              setLoading(false);
            }}
          >
            {t("modal.confirm")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
