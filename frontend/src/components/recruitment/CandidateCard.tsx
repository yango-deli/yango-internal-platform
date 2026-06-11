"use client";

import { Copy, Bike, Store, Building2, Phone, Briefcase, Clock } from "lucide-react";
import { useI18n } from "@/components/providers/i18n-provider";
import { cn } from "@/lib/utils";
import { formatRelativeTime } from "@/lib/recruitment/format";
import { STAGE_ACCENT, type RecruitmentStage } from "@/types/recruitment";
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

  const initials = `${candidate.firstName?.[0] ?? ""}${candidate.lastName?.[0] ?? ""}`.toUpperCase();

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group relative w-full text-start rounded-xl border border-gray-100 bg-white p-3 ps-3.5 shadow-soft transition-all overflow-hidden",
        "hover:shadow-card hover:-translate-y-0.5 active:translate-y-0",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFCC00] focus-visible:ring-offset-1"
      )}
    >
      {/* Stage accent strip (logical start edge → RTL-aware) */}
      <span
        className={cn(
          "absolute inset-y-0 start-0 w-1",
          STAGE_ACCENT[candidate.stage as RecruitmentStage]
        )}
      />

      <div className="flex items-start gap-2.5">
        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gray-100 text-[11px] font-bold text-gray-600">
          {initials || "?"}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <p className="font-semibold text-[13px] leading-tight text-gray-900 truncate">
              {candidate.firstName} {candidate.lastName}
            </p>
            {candidate.isDuplicate && (
              <span
                className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-amber-50"
                aria-label={t("card.duplicate")}
              >
                <Copy className="h-3 w-3 text-amber-500" />
              </span>
            )}
          </div>
          <p className="mt-0.5 flex items-center gap-1 text-xs text-gray-500" dir="ltr">
            <Phone className="h-3 w-3 text-gray-400" />
            {candidate.phone}
          </p>
        </div>
      </div>

      <div className="mt-2.5 flex items-center gap-1.5 flex-wrap">
        {/* Profession sticker — the position the lead applied for */}
        {candidate.position?.title && (
          <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-[#FFF3B0] text-[#8A6D00] font-semibold">
            <Briefcase className="h-3 w-3" />
            {candidate.position.title}
          </span>
        )}
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 font-medium">
          {t(`sources.${candidate.source}`)}
        </span>
        {WorkerIcon && (
          <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 font-medium">
            <WorkerIcon className="h-3 w-3" />
            {t(`workerTypes.${candidate.workerType}`)}
          </span>
        )}
      </div>

      <div className="mt-2.5 flex items-center justify-between border-t border-gray-100 pt-2">
        <div className="flex items-center gap-1.5 min-w-0">
          {candidate.assignedTo ? (
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#FFCC00] text-[10px] font-bold text-gray-900">
              {candidate.assignedTo.name?.[0] ?? "?"}
            </div>
          ) : null}
          {candidate.city && (
            <span className="text-[10px] text-gray-400 truncate">{candidate.city}</span>
          )}
        </div>
        <span className="flex items-center gap-1 text-[10px] text-gray-400 flex-shrink-0">
          <Clock className="h-3 w-3" />
          {t("card.ago", { time: formatRelativeTime(candidate.createdAt, t) })}
        </span>
      </div>
    </button>
  );
}
