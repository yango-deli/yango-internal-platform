"use client";
import { useTranslation } from "next-i18next";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { SlidersHorizontal } from "lucide-react";

const STATUSES = ["active", "inactive", "on_leave", "terminated"];
const TYPES = ["office", "store", "courier"];

interface Props { filters: Record<string, any>; onChange: (f: Record<string, any>) => void; }

export function WorkerFilters({ filters, onChange }: Props) {
  const { t } = useTranslation("hr");

  const toggle = (group: string, val: string) => {
    const current: string[] = filters[group] ?? [];
    const next = current.includes(val) ? current.filter((x) => x !== val) : [...current, val];
    onChange({ ...filters, [group]: next });
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm"><SlidersHorizontal className="h-4 w-4 mr-2" />{t("filters")}</Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 space-y-4">
        <div>
          <p className="text-xs font-semibold mb-2">{t("fields.status")}</p>
          <div className="space-y-1">
            {STATUSES.map((s) => (
              <div key={s} className="flex items-center gap-2">
                <Checkbox id={`s-${s}`} checked={(filters.status ?? []).includes(s)} onCheckedChange={() => toggle("status", s)} />
                <Label htmlFor={`s-${s}`} className="text-sm cursor-pointer">{t(`status.${s}`)}</Label>
              </div>
            ))}
          </div>
        </div>
        <div>
          <p className="text-xs font-semibold mb-2">{t("fields.workerType")}</p>
          <div className="space-y-1">
            {TYPES.map((tp) => (
              <div key={tp} className="flex items-center gap-2">
                <Checkbox id={`t-${tp}`} checked={(filters.workerType ?? []).includes(tp)} onCheckedChange={() => toggle("workerType", tp)} />
                <Label htmlFor={`t-${tp}`} className="text-sm cursor-pointer">{t(`workerType.${tp}`)}</Label>
              </div>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}