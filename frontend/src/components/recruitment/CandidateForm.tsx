"use client";

import { useState } from "react";
import { useI18n } from "@/components/providers/i18n-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CANDIDATE_SOURCES, WORKER_TYPES } from "@/types/recruitment";
import { DuplicateWarningBanner } from "./DuplicateWarningBanner";

export interface CandidateFormData {
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  idNumber?: string;
  source: string;
  sourceDetail?: string;
  workerType?: string;
  city?: string;
  vehicleType?: string;
}

export function CandidateForm({
  initial,
  onSubmit,
  submitLabel,
}: {
  initial?: Partial<CandidateFormData>;
  onSubmit: (data: CandidateFormData, overrideDuplicate?: boolean) => Promise<void>;
  submitLabel?: string;
}) {
  const { t } = useI18n();
  const [form, setForm] = useState<CandidateFormData>({
    firstName: initial?.firstName ?? "",
    lastName: initial?.lastName ?? "",
    phone: initial?.phone ?? "",
    email: initial?.email ?? "",
    idNumber: initial?.idNumber ?? "",
    source: initial?.source ?? "manual",
    sourceDetail: initial?.sourceDetail ?? "",
    workerType: initial?.workerType ?? "",
    city: initial?.city ?? "",
    vehicleType: initial?.vehicleType ?? "",
  });
  const [showDuplicate, setShowDuplicate] = useState(false);
  const [loading, setLoading] = useState(false);

  function set<K extends keyof CandidateFormData>(key: K, value: CandidateFormData[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  return (
    <form
      className="space-y-4"
      onSubmit={async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
          await onSubmit(form);
        } catch (err) {
          if (err instanceof Error && err.message === "duplicate") {
            setShowDuplicate(true);
          }
        } finally {
          setLoading(false);
        }
      }}
    >
      {showDuplicate && (
        <DuplicateWarningBanner
          onOverride={async () => {
            setLoading(true);
            await onSubmit(form, true);
            setShowDuplicate(false);
            setLoading(false);
          }}
        />
      )}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>{t("form.firstName")}</Label>
          <Input value={form.firstName} onChange={(e) => set("firstName", e.target.value)} required />
        </div>
        <div>
          <Label>{t("form.lastName")}</Label>
          <Input value={form.lastName} onChange={(e) => set("lastName", e.target.value)} required />
        </div>
      </div>
      <div>
        <Label>{t("form.phone")}</Label>
        <Input value={form.phone} onChange={(e) => set("phone", e.target.value)} required />
      </div>
      <div>
        <Label>{t("form.email")}</Label>
        <Input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} />
      </div>
      <div>
        <Label>{t("form.idNumber")}</Label>
        <Input value={form.idNumber} onChange={(e) => set("idNumber", e.target.value)} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>{t("form.source")}</Label>
          <Select value={form.source} onValueChange={(v) => set("source", v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {CANDIDATE_SOURCES.map((s) => (
                <SelectItem key={s} value={s}>{t(`sources.${s}`)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>{t("form.workerType")}</Label>
          <Select value={form.workerType || ""} onValueChange={(v) => set("workerType", v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {WORKER_TYPES.map((w) => (
                <SelectItem key={w} value={w}>{t(`workerTypes.${w}`)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>{t("form.city")}</Label>
          <Input value={form.city} onChange={(e) => set("city", e.target.value)} />
        </div>
        <div>
          <Label>{t("form.vehicleType")}</Label>
          <Input value={form.vehicleType} onChange={(e) => set("vehicleType", e.target.value)} />
        </div>
      </div>
      <Button type="submit" disabled={loading}>
        {submitLabel ?? t("form.create")}
      </Button>
    </form>
  );
}
