"use client";

import { useMemo, useState } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from "@dnd-kit/core";
import { useI18n } from "@/components/providers/i18n-provider";
import {
  RECRUITMENT_STAGES,
  STAGES_REQUIRING_REASON,
  type RecruitmentStage,
} from "@/types/recruitment";
import { KanbanColumn } from "./KanbanColumn";
import { CandidateCard } from "./CandidateCard";
import { StageReasonModal } from "./StageReasonModal";
import type { CandidateListItem } from "./types";

export function KanbanBoard({
  candidates,
  onStageChange,
  onCardClick,
}: {
  candidates: CandidateListItem[];
  onStageChange: (id: string, stage: RecruitmentStage, reason?: string) => Promise<void>;
  onCardClick: (id: string) => void;
}) {
  const { isRtl } = useI18n();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [pending, setPending] = useState<{
    id: string;
    stage: RecruitmentStage;
  } | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const stages = useMemo(
    () => (isRtl ? [...RECRUITMENT_STAGES].reverse() : [...RECRUITMENT_STAGES]),
    [isRtl]
  );

  const byStage = useMemo(() => {
    const map: Record<string, CandidateListItem[]> = {};
    for (const stage of RECRUITMENT_STAGES) map[stage] = [];
    for (const c of candidates) {
      if (map[c.stage]) map[c.stage].push(c);
    }
    return map;
  }, [candidates]);

  const activeCandidate = activeId
    ? candidates.find((c) => c.id === activeId)
    : null;

  async function handleDragEnd(event: DragEndEvent) {
    setActiveId(null);
    const { active, over } = event;
    if (!over) return;

    const candidateId = String(active.id);
    const newStage = String(over.id) as RecruitmentStage;
    const candidate = candidates.find((c) => c.id === candidateId);
    if (!candidate || candidate.stage === newStage) return;
    if (!RECRUITMENT_STAGES.includes(newStage)) return;

    if (STAGES_REQUIRING_REASON.includes(newStage)) {
      setPending({ id: candidateId, stage: newStage });
      return;
    }

    await onStageChange(candidateId, newStage);
  }

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={(e) => setActiveId(String(e.active.id))}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-slim">
          {stages.map((stage) => (
            <KanbanColumn
              key={stage}
              stage={stage}
              candidates={byStage[stage] ?? []}
              onCardClick={onCardClick}
            />
          ))}
        </div>
        <DragOverlay>
          {activeCandidate ? (
            <div className="opacity-90 rotate-2">
              <CandidateCard
                candidate={activeCandidate}
                onClick={() => {}}
              />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {pending && (
        <StageReasonModal
          open
          stage={pending.stage}
          onConfirm={async (reason) => {
            await onStageChange(pending.id, pending.stage, reason);
            setPending(null);
          }}
          onCancel={() => setPending(null)}
        />
      )}
    </>
  );
}
