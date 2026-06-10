"use client";
import { useRef, useState } from "react";
import { useTranslation } from "next-i18next";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Camera } from "lucide-react";
import { toast } from "sonner";
import { differenceInDays, differenceInMonths, differenceInYears } from "date-fns";

interface Props { worker: any; onUpdate: () => void; }

const STATUS_COLORS: Record<string, string> = {
  active: "bg-green-100 text-green-800",
  inactive: "bg-gray-100 text-gray-700",
  on_leave: "bg-yellow-100 text-yellow-800",
  terminated: "bg-red-100 text-red-800",
};

function getTenure(t: any, startDate: string | null): string {
  if (!startDate) return "";
  const start = new Date(startDate);
  const now = new Date();
  const years = differenceInYears(now, start);
  if (years > 0) return t("tenure.years_other", { count: years });
  const months = differenceInMonths(now, start);
  if (months > 0) return t("tenure.months_other", { count: months });
  const days = differenceInDays(now, start);
  if (days === 0) return t("tenure.today");
  return t("tenure.days_other", { count: days });
}

export function WorkerProfileHeader({ worker, onUpdate }: Props) {
  const { t } = useTranslation("hr");
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch(`/api/hr/workers/${worker.id}/photo`, { method: "POST", body: fd });
    if (res.ok) { toast.success("Photo updated"); onUpdate(); }
    else toast.error(t("common.error"));
    setUploading(false);
  };

  const initials = `${worker.firstName?.[0] ?? ""}${worker.lastName?.[0] ?? ""}`.toUpperCase();

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 rounded-xl border bg-card">
      <div className="relative group">
        <Avatar className="h-20 w-20">
          <AvatarImage src={worker.profileImage} />
          <AvatarFallback className="text-xl bg-primary/10 text-primary font-bold">{initials}</AvatarFallback>
        </Avatar>
        <Button size="icon" variant="secondary" className="absolute bottom-0 right-0 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => fileRef.current?.click()} disabled={uploading}>
          <Camera className="h-3 w-3" />
        </Button>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
      </div>
      <div className="flex-1 space-y-1">
        <h2 className="text-xl font-bold">{worker.firstName} {worker.lastName}</h2>
        <p className="text-muted-foreground">{worker.positionTitle ?? "\u2014"} {worker.employeeNumber ? `\u00b7 #${worker.employeeNumber}` : ""}</p>
        <div className="flex flex-wrap gap-2">
          <Badge className={STATUS_COLORS[worker.status]}>{t(`status.${worker.status}`)}</Badge>
          {worker.workerType && <Badge variant="outline">{t(`workerType.${worker.workerType}`)}</Badge>}
          {worker.startDate && <Badge variant="secondary">{getTenure(t, worker.startDate)}</Badge>}
        </div>
      </div>
    </div>
  );
}