"use client";

import { useEffect, useState } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { useSession } from "next-auth/react";
import { Role } from "@prisma/client";
import { toast } from "sonner";
import { useI18n } from "@/components/providers/i18n-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/recruitment/format";
import { STAGES_REQUIRING_REASON } from "@/types/recruitment";
import { ActivityTimeline } from "./ActivityTimeline";
import { NotesList } from "./NotesList";
import { StageSelector } from "./StageSelector";
import { StageReasonModal } from "./StageReasonModal";
import { DuplicateWarningBanner } from "./DuplicateWarningBanner";
import type { CandidateDetail } from "./types";

type Tab = "overview" | "activity" | "notes" | "history";

export function CandidateSidePanel({
  candidateId,
  onClose,
  onUpdated,
}: {
  candidateId: string | null;
  onClose: () => void;
  onUpdated: () => void;
}) {
  const { t, isRtl } = useI18n();
  const { data: session } = useSession();
  const [candidate, setCandidate] = useState<CandidateDetail | null>(null);
  const [tab, setTab] = useState<Tab>("overview");
  const [pendingStage, setPendingStage] = useState<string | null>(null);

  const role = session?.user?.role;
  const canConvert =
    (role === Role.admin || role === Role.manager) &&
    candidate?.stage === "hired";
  const canDelete = role === Role.admin;

  useEffect(() => {
    if (!candidateId) {
      setCandidate(null);
      return;
    }
    fetch(`/api/recruitment/candidates/${candidateId}`)
      .then((r) => r.json())
      .then(setCandidate);
  }, [candidateId]);

  if (!candidateId) return null;

  const CloseIcon = isRtl ? ChevronRight : ChevronLeft;

  async function patch(data: Record<string, unknown>) {
    const res = await fetch(`/api/recruitment/candidates/${candidateId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("failed");
    const updated = await res.json();
    setCandidate(updated);
    onUpdated();
    toast.success(t("toast.saved"));
  }

  async function handleStageChange(stage: string, reason?: string) {
    await patch({ stage, reason });
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: "overview", label: t("panel.overview") },
    { key: "activity", label: t("panel.activity") },
    { key: "notes", label: t("panel.notes") },
    { key: "history", label: t("panel.stageHistory") },
  ];

  return (
    <>
      <div className="fixed inset-0 bg-black/20 z-40" onClick={onClose} />
      <aside
        className={cn(
          "fixed top-0 bottom-0 z-50 w-full max-w-md bg-white shadow-xl flex flex-col",
          isRtl ? "start-0 border-e" : "end-0 border-s",
          "border-gray-200"
        )}
      >
        <div className="flex items-center justify-between p-4 border-b">
          <button type="button" onClick={onClose} className="p-1">
            <CloseIcon className="h-5 w-5" />
          </button>
          <h2 className="font-semibold text-sm">
            {candidate
              ? `${candidate.firstName} ${candidate.lastName}`
              : "..."}
          </h2>
          <button type="button" onClick={onClose} className="p-1">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex border-b overflow-x-auto">
          {tabs.map((tb) => (
            <button
              key={tb.key}
              type="button"
              onClick={() => setTab(tb.key)}
              className={cn(
                "px-4 py-2 text-xs font-medium whitespace-nowrap border-b-2",
                tab === tb.key
                  ? "border-[#FFCC00] text-gray-900"
                  : "border-transparent text-gray-500"
              )}
            >
              {tb.label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {!candidate ? (
            <div className="animate-pulse h-32 bg-gray-100 rounded" />
          ) : tab === "overview" ? (
            <div className="space-y-4">
              {candidate.isDuplicate && <DuplicateWarningBanner />}
              <div>
                <Label>{t("table.stage")}</Label>
                <StageSelector
                  value={candidate.stage}
                  onChange={(stage) => {
                    if (STAGES_REQUIRING_REASON.includes(stage as "rejected" | "irrelevant")) {
                      setPendingStage(stage);
                    } else {
                      handleStageChange(stage);
                    }
                  }}
                />
              </div>
              {[
                ["form.phone", candidate.phone],
                ["form.email", candidate.email ?? "—"],
                ["form.city", candidate.city ?? "—"],
                ["form.source", t(`sources.${candidate.source}`)],
                ["form.workerType", candidate.workerType ? t(`workerTypes.${candidate.workerType}`) : "—"],
              ].map(([label, value]) => (
                <div key={label}>
                  <Label>{t(label)}</Label>
                  <Input value={String(value)} readOnly className="bg-gray-50" />
                </div>
              ))}
              {canConvert && (
                <Button
                  className="w-full"
                  onClick={async () => {
                    await fetch("/api/hr/workers/from-candidate", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ candidateId: candidate.id }),
                    });
                    toast.success(t("panel.convertToWorker"));
                  }}
                >
                  {t("panel.convertToWorker")}
                </Button>
              )}
              {canDelete && (
                <Button
                  variant="outline"
                  className="w-full text-red-600"
                  onClick={async () => {
                    await fetch(`/api/recruitment/candidates/${candidate.id}`, {
                      method: "DELETE",
                    });
                    toast.success(t("toast.deleted"));
                    onClose();
                    onUpdated();
                  }}
                >
                  {t("panel.delete")}
                </Button>
              )}
            </div>
          ) : tab === "activity" ? (
            <ActivityTimeline activities={candidate.activities ?? []} />
          ) : tab === "notes" ? (
            <NotesList
              notes={candidate.notes ?? []}
              onAdd={async (content) => {
                await fetch(`/api/recruitment/candidates/${candidateId}/notes`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ content }),
                });
                const refreshed = await fetch(`/api/recruitment/candidates/${candidateId}`).then((r) => r.json());
                setCandidate(refreshed);
              }}
              onTogglePin={async (nid, isPinned) => {
                await fetch(`/api/recruitment/candidates/${candidateId}/notes/${nid}`, {
                  method: "PATCH",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ isPinned }),
                });
                const refreshed = await fetch(`/api/recruitment/candidates/${candidateId}`).then((r) => r.json());
                setCandidate(refreshed);
              }}
              onDelete={async (nid) => {
                await fetch(`/api/recruitment/candidates/${candidateId}/notes/${nid}`, {
                  method: "DELETE",
                });
                const refreshed = await fetch(`/api/recruitment/candidates/${candidateId}`).then((r) => r.json());
                setCandidate(refreshed);
              }}
            />
          ) : (
            <div className="space-y-3">
              {(candidate.stageHistory ?? []).map((h) => (
                <div key={h.id} className="p-3 rounded-lg border text-sm">
                  <p>
                    {t(`stages.${h.fromStage}`)} → {t(`stages.${h.toStage}`)}
                  </p>
                  {h.reason && (
                    <p className="text-xs text-gray-500 mt-1">{h.reason}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-1">
                    {h.changedBy.name} · {formatDate(h.createdAt)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </aside>

      {pendingStage && (
        <StageReasonModal
          open
          stage={pendingStage as "rejected" | "irrelevant"}
          onConfirm={async (reason) => {
            await handleStageChange(pendingStage, reason);
            setPendingStage(null);
          }}
          onCancel={() => setPendingStage(null)}
        />
      )}
    </>
  );
}
