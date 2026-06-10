"use client";

import { useI18n } from "@/components/providers/i18n-provider";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const CANDIDATE_FIELDS = [
  "firstName",
  "lastName",
  "phone",
  "email",
  "idNumber",
  "source",
  "sourceDetail",
  "workerType",
  "city",
  "vehicleType",
] as const;

export type FieldMapping = Record<string, string>;

export function ColumnMapper({
  columns,
  mapping,
  onChange,
}: {
  columns: string[];
  mapping: FieldMapping;
  onChange: (mapping: FieldMapping) => void;
}) {
  const { t } = useI18n();

  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-600">{t("import.mapInstructions")}</p>
      <div className="grid grid-cols-2 gap-2 text-xs font-medium text-gray-500 px-1">
        <span>{t("import.fileColumn")}</span>
        <span>{t("import.candidateField")}</span>
      </div>
      {columns.map((col) => (
        <div key={col} className="grid grid-cols-2 gap-3 items-center">
          <Label className="text-sm truncate">{col}</Label>
          <Select
            value={mapping[col] ?? ""}
            onValueChange={(v) =>
              onChange({ ...mapping, [col]: v === "skip" ? "" : v })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="—" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="skip">—</SelectItem>
              {CANDIDATE_FIELDS.map((f) => (
                <SelectItem key={f} value={f}>
                  {t(`form.${f}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ))}
    </div>
  );
}
