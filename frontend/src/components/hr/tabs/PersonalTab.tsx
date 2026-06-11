"use client";
import { useTranslation } from "next-i18next";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const MARITAL = ["single","married","divorced","separated","widowed"];

export function PersonalTab({ worker, onChange }: { worker: any; onChange: (p: any) => void }) {
  const { t } = useTranslation("hr");
  const field = (key: string) => ({ value: worker[key] ?? "", onChange: (e: any) => onChange({ [key]: e.target.value }) });
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {(["firstName","lastName","phone","email","workEmail","idNumber","dateOfBirth","address","city"] as const).map((k) => (
        <div key={k} className="space-y-1">
          <Label className="text-xs">{t(`fields.${k}`)}</Label>
          <Input type={k === "dateOfBirth" ? "date" : "text"} {...field(k)} />
        </div>
      ))}
      <div className="space-y-1">
        <Label className="text-xs">{t("fields.maritalStatus")}</Label>
        <Select value={worker.maritalStatus ?? ""} onValueChange={(v) => onChange({ maritalStatus: v })}>
          <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
          <SelectContent>{MARITAL.map((s) => <SelectItem key={s} value={s}>{t(`maritalStatus.${s}`)}</SelectItem>)}</SelectContent>
        </Select>
      </div>
    </div>
  );
}