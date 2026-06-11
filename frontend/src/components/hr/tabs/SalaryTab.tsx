"use client";
import { useTranslation } from "next-i18next";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ISRAELI_BANKS } from "@/lib/hr/banks";

export function SalaryTab({ worker, onChange }: { worker: any; onChange: (p: any) => void }) {
  const { t, i18n } = useTranslation("hr");
  const lang = i18n.language as "en" | "he" | "ru";
  const field = (key: string) => ({ value: worker[key] ?? "", onChange: (e: any) => onChange({ [key]: e.target.value }) });
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold mb-3">{t("salary.grossNet")}</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1"><Label className="text-xs">{t("fields.grossSalary")}</Label><Input type="number" {...field("grossSalary")} /></div>
          <div className="space-y-1"><Label className="text-xs">{t("fields.netSalary")}</Label><Input type="number" {...field("netSalary")} /></div>
        </div>
      </div>
      <div>
        <p className="text-sm font-semibold mb-3">{t("salary.banking")}</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1"><Label className="text-xs">{t("fields.bankName")}</Label>
            <Select value={worker.bankName ?? ""} onValueChange={(v) => onChange({ bankName: v })}>
              <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
              <SelectContent>{ISRAELI_BANKS.map((b) => <SelectItem key={b.key} value={b.key}>{b[lang] ?? b.en}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-1"><Label className="text-xs">{t("fields.bankBranch")}</Label><Input {...field("bankBranch")} /></div>
          <div className="space-y-1 md:col-span-2"><Label className="text-xs">{t("fields.bankAccount")}</Label><Input {...field("bankAccount")} /></div>
        </div>
      </div>
    </div>
  );
}