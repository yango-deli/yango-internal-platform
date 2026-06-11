"use client";

import { useDroppable } from "@dnd-kit/core";
import { useI18n } from "@/components/providers/i18n-provider";
import { cn } from "@/lib/utils";
import { STAGE_ACCENT, type RecruitmentStage } from "@/types/recruitment";
import { DraggableCandidateCard } from "./DraggableCandidateCard";
import type { CandidateListItem } from "./types";

export function KanbanColumn({
  stage,
  candidates,
  onCardClick,
}: {
  stage: RecruitmentStage;
  candidates: CandidateListItem[];
  onCardClick: (id: string) => void;
}) {
  const { t } = useI18n();
  const { setNodeRef, isOver } = useDroppable({ id: stage });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex flex-col w-[17rem] min-w-[17rem] rounded-2xl border border-gray-100 bg-gray-50/70 transition-all",
        isOver && "ring-2 ring-[#FFCC00] ring-offset-2 bg-[#FFF8D6]/60"
      )}
    >
      <div className="flex items-center justify-between gap-2 px-3.5 py-3">
        <div className="flex items-center gap-2 min-w-0">
          <span className={cn("h-2.5 w-2.5 rounded-full flex-shrink-0", STAGE_ACCENT[stage])} />
          <h3 className="text-[13px] font-semibold text-gray-700 truncate">
            {t(`stages.${stage}`)}
          </h3>
        </div>
        <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-white px-1.5 text-[11px] font-semibold text-gray-500 ring-1 ring-gray-200">
          {candidates.length}
        </span>
      </div>
      <div className="flex-1 px-2 pb-2 space-y-2 min-h-[120px] max-h-[calc(100vh-240px)] overflow-y-auto scrollbar-slim">
        {candidates.map((c) => (
          <DraggableCandidateCard
            key={c.id}
            candidate={c}
            onClick={() => onCardClick(c.id)}
          />
        ))}
      </div>
    </div>
  );
}
