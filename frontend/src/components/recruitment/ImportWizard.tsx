"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload } from "lucide-react";
import * as XLSX from "xlsx";
import { toast } from "sonner";
import { useI18n } from "@/components/providers/i18n-provider";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ColumnMapper, type FieldMapping } from "./ColumnMapper";
import type { RawCandidate } from "@/types/recruitment";

type Step = "upload" | "map" | "preview" | "results";

export function ImportWizard() {
  const { t } = useI18n();
  const [step, setStep] = useState<Step>("upload");
  const [columns, setColumns] = useState<string[]>([]);
  const [rows, setRows] = useState<Record<string, string>[]>([]);
  const [mapping, setMapping] = useState<FieldMapping>({});
  const [results, setResults] = useState<{
    imported: number;
    duplicates: number;
    errors: { row: number; message: string }[];
  } | null>(null);

  const onDrop = useCallback((files: File[]) => {
    const file = files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target?.result as ArrayBuffer);
      const wb = XLSX.read(data, { type: "array" });
      const sheet = wb.Sheets[wb.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json<Record<string, string>>(sheet, {
        defval: "",
      });
      if (!json.length) return;
      const cols = Object.keys(json[0]);
      setColumns(cols);
      setRows(json);
      setMapping({});
      setStep("map");
    };
    reader.readAsArrayBuffer(file);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "text/csv": [".csv"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
      "application/vnd.ms-excel": [".xls"],
    },
    maxFiles: 1,
  });

  function buildCandidates(): RawCandidate[] {
    return rows.map((row) => {
      const c: Record<string, string> = { source: "manual" };
      for (const [col, field] of Object.entries(mapping)) {
        if (field && row[col] !== undefined) c[field] = String(row[col]);
      }
      return c as unknown as RawCandidate;
    });
  }

  async function runImport(overrideDuplicates = false) {
    const candidates = buildCandidates();
    const res = await fetch("/api/recruitment/candidates/import", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ candidates, overrideDuplicates }),
    });
    const data = await res.json();
    setResults(data);
    setStep("results");
    toast.success(t("toast.imported"));
  }

  const previewRows = rows.slice(0, 10);
  const mappedFields = Object.values(mapping).filter(Boolean);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-xl font-semibold">{t("import.title")}</h1>

      <div className="flex gap-2 text-xs">
        {(
          [
            ["upload", "import.stepUpload"],
            ["map", "import.stepMap"],
            ["preview", "import.stepPreview"],
            ["results", "import.stepResults"],
          ] as const
        ).map(([s, labelKey]) => (
          <span
            key={s}
            className={cn(
              "px-2 py-1 rounded",
              step === s ? "bg-[#FFCC00] text-gray-900" : "bg-gray-100 text-gray-500"
            )}
          >
            {t(labelKey)}
          </span>
        ))}
      </div>

      {step === "upload" && (
        <div
          {...getRootProps()}
          className={cn(
            "border-2 border-dashed rounded-xl p-10 text-center cursor-pointer",
            isDragActive ? "border-[#FFCC00] bg-yellow-50" : "border-gray-200"
          )}
        >
          <input {...getInputProps()} />
          <Upload className="h-8 w-8 mx-auto text-gray-400 mb-3" />
          <p className="font-medium">{t("import.dropzone")}</p>
          <p className="text-sm text-gray-400 mt-1">{t("import.browse")}</p>
        </div>
      )}

      {step === "map" && (
        <>
          <ColumnMapper columns={columns} mapping={mapping} onChange={setMapping} />
          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep("upload")}>
              {t("import.back")}
            </Button>
            <Button
              onClick={() => setStep("preview")}
              disabled={!mappedFields.includes("firstName") || !mappedFields.includes("lastName") || !mappedFields.includes("phone")}
            >
              {t("import.next")}
            </Button>
          </div>
        </>
      )}

      {step === "preview" && (
        <>
          <p className="text-sm font-medium">{t("import.previewTitle")}</p>
          <div className="rounded-xl border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  {mappedFields.map((f) => (
                    <TableHead key={f}>{t(`form.${f}`)}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {previewRows.map((row, i) => (
                  <TableRow key={i}>
                    {mappedFields.map((f) => {
                      const col = Object.entries(mapping).find(([, v]) => v === f)?.[0];
                      return <TableCell key={f}>{col ? row[col] : ""}</TableCell>;
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep("map")}>
              {t("import.back")}
            </Button>
            <Button onClick={() => runImport()}>
              {t("import.importButton", { count: rows.length })}
            </Button>
          </div>
        </>
      )}

      {step === "results" && results && (
        <div className="space-y-2 p-4 rounded-xl bg-gray-50">
          <p>{t("import.resultsImported", { count: results.imported })}</p>
          <p>{t("import.resultsDuplicates", { count: results.duplicates })}</p>
          <p>{t("import.resultsErrors", { count: results.errors.length })}</p>
        </div>
      )}
    </div>
  );
}
