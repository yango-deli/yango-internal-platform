"use client";

import { useDraggable } from "@dnd-kit/core";
import { CandidateCard } from "./CandidateCard";
import type { CandidateListItem } from "./types";

export function DraggableCandidateCard({
  candidate,
  onClick,
}: {
  candidate: CandidateListItem;
  onClick: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id: candidate.id });

  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={isDragging ? "opacity-40" : ""}
    >
      <CandidateCard candidate={candidate} onClick={onClick} />
    </div>
  );
}
