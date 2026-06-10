"use client";

import { useDroppable } from "@dnd-kit/core";
import { useI18n } from "@/components/providers/i18n-provider";
import { cn } from "@/lib/utils";
import { STAGE_COLORS, type RecruitmentStage } from "@/types/recruitment";
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
  const colors = STAGE_COLORS[stage];

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex flex-col w-64 min-w-[16rem] rounded-xl border bg-gray-50/80",
        isOver && "ring-2 ring-[#FFCC00]"
      )}
    >
      <div className={cn("px-3 py-2 rounded-t-xl border-b", colors)}>
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold">{t(`stages.${stage}`)}</h3>
          <span className="text-[10px] font-medium opacity-70">
            {candidates.length}
          </span>
        </div>
      </div>
      <div className="flex-1 p-2 space-y-2 min-h-[120px] max-h-[calc(100vh-220px)] overflow-y-auto">
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
