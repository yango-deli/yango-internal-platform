"use client";

import { useCallback, useMemo, useState } from "react";
import useSWR from "swr";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Plus, BarChart3, Upload, UserPlus, Search } from "lucide-react";
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
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">{t("page.title")}</h1>
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

      <div className="flex flex-wrap items-center gap-2.5">
        <div className="relative w-full max-w-xs">
          <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            className="ps-9 rounded-full"
            placeholder={t("page.search")}
            value={filters.search}
            onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
          />
        </div>
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
        <div className="flex items-center gap-1 rounded-full border border-gray-200 bg-white p-1 ms-auto shadow-soft">
          <Link
            href="/recruitment"
            className={cn(
              "rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors",
              view === "kanban"
                ? "bg-[#FFCC00] text-gray-900 shadow-soft"
                : "text-gray-500 hover:text-gray-900"
            )}
          >
            {t("page.viewKanban")}
          </Link>
          <Link
            href="/recruitment?view=table"
            className={cn(
              "rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors",
              view === "table"
                ? "bg-[#FFCC00] text-gray-900 shadow-soft"
                : "text-gray-500 hover:text-gray-900"
            )}
          >
            {t("page.viewTable")}
          </Link>
        </div>
      </div>

      {isLoading ? (
        <div className="flex gap-3 overflow-x-auto pb-2" aria-hidden>
          {Array.from({ length: 5 }).map((_, col) => (
            <div
              key={col}
              className="flex flex-col w-64 min-w-[16rem] rounded-xl border border-gray-100 bg-gray-50/80"
            >
              <div className="h-8 rounded-t-xl bg-gray-200/70 animate-pulse" />
              <div className="p-2 space-y-2">
                {Array.from({ length: 3 - (col % 2) }).map((_, c) => (
                  <div
                    key={c}
                    className="h-20 rounded-lg bg-white border border-gray-100 shadow-sm animate-pulse"
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : !candidates.length ? (
        <div className="flex flex-col items-center text-center py-16">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#FFF3B0]">
            <UserPlus className="h-7 w-7 text-[#E6B800]" />
          </div>
          <p className="mt-4 font-semibold text-gray-900">{t("page.empty")}</p>
          <p className="text-sm text-gray-500 mt-1 max-w-sm">
            {t("page.emptyDescription")}
          </p>
          <Button size="sm" className="mt-5" onClick={() => setShowAdd(true)}>
            <Plus className="h-4 w-4 me-1" />
            {t("page.addCandidate")}
          </Button>
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
