"use client";
import { useTranslation } from "next-i18next";
import { useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Camera, Save, X } from "lucide-react";
import { toast } from "sonner";
import { differenceInMonths } from "date-fns";

const STATUS_COLORS: Record<string, string> = {
  active: "bg-green-100 text-green-800 border-green-200",
  inactive: "bg-gray-100 text-gray-600 border-gray-200",
  on_leave: "bg-yellow-100 text-yellow-800 border-yellow-200",
  terminated: "bg-red-100 text-red-800 border-red-200",
};

interface Props { worker: any; editing: boolean; onSave: () => void; onDiscard: () => void; onWorkerUpdate: (w: any) => void; }

export function WorkerProfileHeader({ worker, editing, onSave, onDiscard, onWorkerUpdate }: Props) {
  const { t } = useTranslation("hr");
  const fileRef = useRef<HTMLInputElement>(null);
  const initials = `${worker.firstName?.[0] ?? ""}${worker.lastName?.[0] ?? ""}`.toUpperCase();

  const tenure = () => {
    if (!worker.startDate) return null;
    const months = differenceInMonths(new Date(), new Date(worker.startDate));
    const years = Math.floor(months / 12);
    const rem = months % 12;
    if (years > 0 && rem > 0) return t("profile.tenure", { years, months: rem });
    if (years > 0) return t("profile.tenureYears", { years });
    return t("profile.tenureMonths", { months: rem });
  };

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch(`/api/hr/workers/${worker.id}/photo`, { method: "POST", body: fd });
    if (res.ok) {
      const { url } = await res.json();
      onWorkerUpdate({ ...worker, profileImage: url });
      toast.success(t("profile.uploadPhoto"));
    } else {
      toast.error(t("common.error"));
    }
  };

  return (
    <div className="flex items-start justify-between gap-4 flex-wrap">
      <div className="flex items-center gap-4">
        <div className="relative group">
          <Avatar className="h-20 w-20">
            {worker.profileImage && <AvatarImage src={worker.profileImage} />}
            <AvatarFallback className="text-2xl font-bold">{initials}</AvatarFallback>
          </Avatar>
          <button onClick={() => fileRef.current?.click()} className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
            <Camera className="h-5 w-5 text-white" />
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
        </div>
        <div>
          <h1 className="text-2xl font-bold">{worker.firstName} {worker.lastName}</h1>
          {worker.positionTitle && <p className="text-muted-foreground">{worker.positionTitle}</p>}
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <Badge className={`text-xs ${STATUS_COLORS[worker.status] ?? ""}`}>{t(`status.${worker.status}`)}</Badge>
            {worker.employeeNumber && <span className="text-xs text-muted-foreground">#{worker.employeeNumber}</span>}
            {tenure() && <span className="text-xs text-muted-foreground">{tenure()}</span>}
          </div>
        </div>
      </div>
      {editing && (
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onDiscard}><X className="h-4 w-4 mr-1" />{t("profile.discard")}</Button>
          <Button size="sm" onClick={onSave}><Save className="h-4 w-4 mr-1" />{t("profile.saveAll")}</Button>
        </div>
      )}
    </div>
  );
}