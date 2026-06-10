"use client";

import { Copy, Bike, Store, Building2 } from "lucide-react";
import { useI18n } from "@/components/providers/i18n-provider";
import { cn } from "@/lib/utils";
import { formatRelativeTime } from "@/lib/recruitment/format";
import { STAGE_COLORS, type RecruitmentStage } from "@/types/recruitment";
import type { CandidateListItem } from "./types";

const workerIcons = {
  courier: Bike,
  store: Store,
  office: Building2,
};

export function CandidateCard({
  candidate,
  onClick,
}: {
  candidate: CandidateListItem;
  onClick: () => void;
}) {
  const { t } = useI18n();
  const WorkerIcon =
    candidate.workerType && candidate.workerType in workerIcons
      ? workerIcons[candidate.workerType as keyof typeof workerIcons]
      : null;

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full text-start rounded-lg border bg-white p-3 shadow-sm hover:shadow-md transition-shadow",
        STAGE_COLORS[candidate.stage as RecruitmentStage]?.split(" ")[1]
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="font-medium text-sm text-gray-900">
          {candidate.firstName} {candidate.lastName}
        </p>
        {candidate.isDuplicate && (
          <Copy className="h-3.5 w-3.5 text-amber-500 flex-shrink-0" aria-label={t("card.duplicate")} />
        )}
      </div>
      <p className="text-xs text-gray-500 mt-0.5">{candidate.phone}</p>
      <div className="flex items-center gap-2 mt-2 flex-wrap">
        <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-600">
          {t(`sources.${candidate.source}`)}
        </span>
        {WorkerIcon && (
          <WorkerIcon className="h-3.5 w-3.5 text-gray-400" />
        )}
        {candidate.city && (
          <span className="text-[10px] text-gray-400">{candidate.city}</span>
        )}
      </div>
      <div className="flex items-center justify-between mt-2">
        {candidate.assignedTo ? (
          <div className="flex items-center gap-1">
            <div className="w-5 h-5 rounded-full bg-[#FFCC00] text-[10px] font-bold flex items-center justify-center text-gray-900">
              {candidate.assignedTo.name?.[0] ?? "?"}
            </div>
          </div>
        ) : (
          <span />
        )}
        <span className="text-[10px] text-gray-400">
          {t("card.ago", { time: formatRelativeTime(candidate.updatedAt, t) })}
        </span>
      </div>
    </button>
  );
}
