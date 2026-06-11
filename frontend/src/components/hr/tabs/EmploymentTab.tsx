"use client";
import { useTranslation } from "next-i18next";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";

const WORKER_TYPES = ["office","store","courier"];
const EMP_TYPES = ["permanent","temporary","partial","contractor"];
const VEHICLE_TYPES = ["bike","motorcycle","car"];

export function EmploymentTab({ worker, onChange }: { worker: any; onChange: (p: any) => void }) {
  const { t } = useTranslation("hr");
  const { data: departments } = useSWR("/api/hr/departments", fetcher);
  const { data: stores } = useSWR("/api/hr/stores", fetcher);
  const field = (key: string) => ({ value: worker[key] ?? "", onChange: (e: any) => onChange({ [key]: e.target.value }) });
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-1"><Label className="text-xs">{t("fields.employeeNumber")}</Label><Input {...field("employeeNumber")} /></div>
      <div className="space-y-1"><Label className="text-xs">{t("fields.positionTitle")}</Label><Input {...field("positionTitle")} /></div>
      <div className="space-y-1 md:col-span-2"><Label className="text-xs">{t("fields.positionDesc")}</Label><Input {...field("positionDesc")} /></div>
      <div className="space-y-1"><Label className="text-xs">{t("fields.workerType")}</Label>
        <Select value={worker.workerType ?? ""} onValueChange={(v) => onChange({ workerType: v })}>
          <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
          <SelectContent>{WORKER_TYPES.map((s) => <SelectItem key={s} value={s}>{t(`workerType.${s}`)}</SelectItem>)}</SelectContent>
        </Select>
      </div>
      <div className="space-y-1"><Label className="text-xs">{t("fields.employmentType")}</Label>
        <Select value={worker.employmentType ?? ""} onValueChange={(v) => onChange({ employmentType: v })}>
          <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
          <SelectContent>{EMP_TYPES.map((s) => <SelectItem key={s} value={s}>{t(`employmentType.${s}`)}</SelectItem>)}</SelectContent>
        </Select>
      </div>
      <div className="space-y-1"><Label className="text-xs">{t("fields.jobScope")}</Label><Input type="number" min={0} max={100} {...field("jobScope")} /></div>
      <div className="space-y-1"><Label className="text-xs">{t("fields.department")}</Label>
        <Select value={worker.departmentId ?? ""} onValueChange={(v) => onChange({ departmentId: v })}>
          <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
          <SelectContent>{(departments ?? []).map((d: any) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}</SelectContent>
        </Select>
      </div>
      <div className="space-y-1"><Label className="text-xs">{t("fields.store")}</Label>
        <Select value={worker.storeId ?? ""} onValueChange={(v) => onChange({ storeId: v })}>
          <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
          <SelectContent>{(stores ?? []).map((s: any) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
        </Select>
      </div>
      <div className="space-y-1"><Label className="text-xs">{t("fields.startDate")}</Label><Input type="date" value={worker.startDate ? worker.startDate.slice(0,10) : ""} onChange={(e) => onChange({ startDate: e.target.value })} /></div>
      <div className="space-y-1"><Label className="text-xs">{t("fields.endDate")}</Label><Input type="date" value={worker.endDate ? worker.endDate.slice(0,10) : ""} onChange={(e) => onChange({ endDate: e.target.value })} /></div>
      <div className="space-y-1"><Label className="text-xs">{t("fields.vehicleType")}</Label>
        <Select value={worker.vehicleType ?? ""} onValueChange={(v) => onChange({ vehicleType: v })}>
          <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
          <SelectContent>{VEHICLE_TYPES.map((s) => <SelectItem key={s} value={s}>{t(`vehicleType.${s}`)}</SelectItem>)}</SelectContent>
        </Select>
      </div>
      <div className="space-y-1"><Label className="text-xs">{t("fields.vehicleNumber")}</Label><Input {...field("vehicleNumber")} /></div>
      <div className="space-y-1"><Label className="text-xs">{t("fields.leadSource")}</Label><Input {...field("leadSource")} /></div>
    </div>
  );
}