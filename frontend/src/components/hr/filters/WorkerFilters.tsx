"use client";
import { useTranslation } from "next-i18next";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { SlidersHorizontal, X } from "lucide-react";

const STATUSES = ["active","inactive","on_leave","terminated"];
const WORKER_TYPES = ["office","store","courier"];

export function WorkerFilters({ filters, onChange }: { filters: Record<string, any>; onChange: (f: Record<string, any>) => void }) {
  const { t } = useTranslation("hr");
  const [open, setOpen] = useState(false);
  const toggleArray = (key: string, val: string) => {
    const arr: string[] = filters[key] ?? [];
    onChange({ ...filters, [key]: arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val] });
  };
  const hasFilters = Object.values(filters).some((v) => Array.isArray(v) ? v.length > 0 : !!v);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <SlidersHorizontal className="h-4 w-4" />
          {t("filters")}
          {hasFilters && <span className="h-2 w-2 rounded-full bg-blue-500" />}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 space-y-4">
        <div>
          <p className="text-xs font-semibold mb-2 uppercase tracking-wide text-muted-foreground">{t("fields.status")}</p>
          {STATUSES.map((s) => (
            <div key={s} className="flex items-center gap-2 mb-1">
              <Checkbox id={s} checked={(filters.status ?? []).includes(s)} onCheckedChange={() => toggleArray("status", s)} />
              <Label htmlFor={s} className="text-sm cursor-pointer">{t(`status.${s}`)}</Label>
            </div>
          ))}
        </div>
        <div>
          <p className="text-xs font-semibold mb-2 uppercase tracking-wide text-muted-foreground">{t("fields.workerType")}</p>
          {WORKER_TYPES.map((wt) => (
            <div key={wt} className="flex items-center gap-2 mb-1">
              <Checkbox id={wt} checked={(filters.workerType ?? []).includes(wt)} onCheckedChange={() => toggleArray("workerType", wt)} />
              <Label htmlFor={wt} className="text-sm cursor-pointer">{t(`workerType.${wt}`)}</Label>
            </div>
          ))}
        </div>
        {hasFilters && (
          <Button variant="ghost" size="sm" className="w-full gap-1 text-muted-foreground" onClick={() => onChange({})}>
            <X className="h-3 w-3" />{t("common.cancel")}
          </Button>
        )}
      </PopoverContent>
    </Popover>
  );
}