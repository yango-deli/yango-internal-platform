"use client";

import { useState } from "react";
import { useI18n } from "@/components/providers/i18n-provider";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate } from "@/lib/recruitment/format";
import type { CandidateListItem } from "./types";

export function CandidateTable({
  candidates,
  onRowClick,
  onBulkStage,
  onBulkArchive,
}: {
  candidates: CandidateListItem[];
  onRowClick: (id: string) => void;
  onBulkStage?: (ids: string[]) => void;
  onBulkArchive?: (ids: string[]) => void;
}) {
  const { t } = useI18n();
  const [selected, setSelected] = useState<Set<string>>(new Set());

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const selectedIds = [...selected];

  return (
    <div className="space-y-3">
      {selectedIds.length > 0 && (
        <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
          <span className="text-sm text-gray-600">
            {t("table.selected", { count: selectedIds.length })}
          </span>
          {onBulkStage && (
            <Button size="sm" variant="outline" onClick={() => onBulkStage(selectedIds)}>
              {t("table.bulkStage")}
            </Button>
          )}
          {onBulkArchive && (
            <Button size="sm" variant="outline" onClick={() => onBulkArchive(selectedIds)}>
              {t("table.bulkArchive")}
            </Button>
          )}
        </div>
      )}
      <div className="rounded-xl border bg-white overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10" />
              <TableHead>{t("table.name")}</TableHead>
              <TableHead>{t("table.phone")}</TableHead>
              <TableHead>{t("table.source")}</TableHead>
              <TableHead>{t("table.workerType")}</TableHead>
              <TableHead>{t("table.stage")}</TableHead>
              <TableHead>{t("table.city")}</TableHead>
              <TableHead>{t("table.assignedTo")}</TableHead>
              <TableHead>{t("table.createdAt")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {candidates.map((c) => (
              <TableRow
                key={c.id}
                className="cursor-pointer hover:bg-gray-50"
                onClick={() => onRowClick(c.id)}
              >
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={selected.has(c.id)}
                    onChange={() => toggle(c.id)}
                  />
                </TableCell>
                <TableCell className="font-medium">
                  {c.firstName} {c.lastName}
                </TableCell>
                <TableCell>{c.phone}</TableCell>
                <TableCell>{t(`sources.${c.source}`)}</TableCell>
                <TableCell>
                  {c.workerType ? t(`workerTypes.${c.workerType}`) : "—"}
                </TableCell>
                <TableCell>{t(`stages.${c.stage}`)}</TableCell>
                <TableCell>{c.city ?? "—"}</TableCell>
                <TableCell>{c.assignedTo?.name ?? "—"}</TableCell>
                <TableCell>{formatDate(c.createdAt)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
