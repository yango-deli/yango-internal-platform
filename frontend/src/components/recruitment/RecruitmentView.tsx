"use client";

import { useCallback, useMemo, useState } from "react";
import useSWR from "swr";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Plus, BarChart3, Upload } from "lucide-react";
import { toast } from "sonner";
import { useI18n } from "@/components/providers/i18n-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { CANDIDATE_SOURCES, WORKER_TYPES, type RecruitmentStage } from "@/types/recruitment";
import { KanbanBoard } from "./KanbanBoard";
import { CandidateTable } from "./CandidateTable";
import { CandidateSidePanel } from "./CandidateSidePanel";
import { CandidateForm } from "./CandidateForm";
import type { CandidateListItem } from "./types";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function RecruitmentView() {
  const { t } = useI18n();
  const searchParams = useSearchParams();
  const view = searchParams.get("view") === "table" ? "table" : "kanban";
  const candidateFromUrl = searchParams.get("candidate");

  const [filters, setFilters] = useState({
    source: "",
    workerType: "",
    search: "",
  });
  const [selectedId, setSelectedId] = useState<string | null>(candidateFromUrl);
  const [showAdd, setShowAdd] = useState(false);

  const query = useMemo(() => {
    const p = new URLSearchParams();
    if (filters.source) p.set("source", filters.source);
    if (filters.workerType) p.set("workerType", filters.workerType);
    if (filters.search) p.set("search", filters.search);
    return `/api/recruitment/candidates?${p}`;
  }, [filters]);

  const { data, mutate, isLoading } = useSWR<CandidateListItem[]>(query, fetcher);

  const refresh = useCallback(() => mutate(), [mutate]);

  async function handleStageChange(
    id: string,
    stage: RecruitmentStage,
    reason?: string
  ) {
    const res = await fetch(`/api/recruitment/candidates/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stage, reason }),
    });
    if (!res.ok) {
      toast.error(t("toast.error"));
      return;
    }
    toast.success(t("toast.stageChanged"));
    refresh();
  }

  async function handleBulkArchive(ids: string[]) {
    await fetch("/api/recruitment/candidates", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids, isArchived: true }),
    });
    refresh();
  }

  const candidates = data ?? [];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold">{t("page.title")}</h1>
        <div className="flex items-center gap-2">
          <Link href="/recruitment/stats">
            <Button variant="outline" size="sm">
              <BarChart3 className="h-4 w-4 me-1" />
              {t("page.stats")}
            </Button>
          </Link>
          <Link href="/recruitment/import">
            <Button variant="outline" size="sm">
              <Upload className="h-4 w-4 me-1" />
              {t("page.import")}
            </Button>
          </Link>
          <Button size="sm" onClick={() => setShowAdd(true)}>
            <Plus className="h-4 w-4 me-1" />
            {t("page.addCandidate")}
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Input
          className="max-w-xs"
          placeholder={t("page.search")}
          value={filters.search}
          onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
        />
        <Select
          value={filters.source || "all"}
          onValueChange={(v) =>
            setFilters((f) => ({ ...f, source: v === "all" ? "" : v }))
          }
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder={t("page.allSources")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("page.allSources")}</SelectItem>
            {CANDIDATE_SOURCES.map((s) => (
              <SelectItem key={s} value={s}>
                {t(`sources.${s}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={filters.workerType || "all"}
          onValueChange={(v) =>
            setFilters((f) => ({ ...f, workerType: v === "all" ? "" : v }))
          }
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder={t("page.allWorkerTypes")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("page.allWorkerTypes")}</SelectItem>
            {WORKER_TYPES.map((w) => (
              <SelectItem key={w} value={w}>
                {t(`workerTypes.${w}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex rounded-lg border overflow-hidden ms-auto">
          <Link
            href="/recruitment"
            className={cn(
              "px-3 py-1.5 text-xs font-medium",
              view === "kanban" ? "bg-[#FFCC00]" : "bg-white text-gray-600"
            )}
          >
            {t("page.viewKanban")}
          </Link>
          <Link
            href="/recruitment?view=table"
            className={cn(
              "px-3 py-1.5 text-xs font-medium",
              view === "table" ? "bg-[#FFCC00]" : "bg-white text-gray-600"
            )}
          >
            {t("page.viewTable")}
          </Link>
        </div>
      </div>

      {isLoading ? (
        <div className="h-64 animate-pulse bg-gray-100 rounded-xl" />
      ) : !candidates.length ? (
        <div className="text-center py-16 text-gray-400">
          <p className="font-medium">{t("page.empty")}</p>
          <p className="text-sm mt-1">{t("page.emptyDescription")}</p>
        </div>
      ) : view === "table" ? (
        <CandidateTable
          candidates={candidates}
          onRowClick={setSelectedId}
          onBulkArchive={handleBulkArchive}
        />
      ) : (
        <KanbanBoard
          candidates={candidates}
          onStageChange={handleStageChange}
          onCardClick={setSelectedId}
        />
      )}

      <CandidateSidePanel
        candidateId={selectedId}
        onClose={() => setSelectedId(null)}
        onUpdated={refresh}
      />

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t("page.addCandidate")}</DialogTitle>
          </DialogHeader>
          <CandidateForm
            onSubmit={async (data, overrideDuplicate) => {
              const res = await fetch("/api/recruitment/candidates", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...data, overrideDuplicate }),
              });
              if (res.status === 409) throw new Error("duplicate");
              if (!res.ok) {
                toast.error(t("toast.error"));
                return;
              }
              toast.success(t("toast.created"));
              setShowAdd(false);
              refresh();
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
