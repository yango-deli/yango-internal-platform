"use client";
import { useTranslation } from "next-i18next";
import { useRef, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Camera, Save, X, Trash2 } from "lucide-react";
import { toast } from "sonner";

const STATUSES = ["active","inactive","on_leave","terminated"];
const STATUS_COLORS: Record<string, string> = { active: "bg-green-100 text-green-800", inactive: "bg-gray-100 text-gray-600", on_leave: "bg-yellow-100 text-yellow-800", terminated: "bg-red-100 text-red-800" };

export function WorkerProfileHeader({ worker, editing, onChange, onSave, onDiscard, onDelete, saving }: {
  worker: any; editing: boolean; onChange: (f: Partial<any>) => void;
  onSave: () => void; onDiscard: () => void; onDelete: () => void; saving: boolean;
}) {
  const { t } = useTranslation("hr");
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const initials = `${worker.firstName?.[0] ?? ""}${worker.lastName?.[0] ?? ""}`.toUpperCase();

  const handlePhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    setUploading(true);
    const fd = new FormData(); fd.append("file", file);
    const res = await fetch(`/api/hr/workers/${worker.id}/photo`, { method: "POST", body: fd });
    if (res.ok) { const { url } = await res.json(); onChange({ profileImage: url }); toast.success(t("profile.uploadPhoto")); }
    else toast.error(t("common.error"));
    setUploading(false);
  };

  const tenure = () => {
    if (!worker.startDate) return null;
    const months = Math.floor((Date.now() - new Date(worker.startDate).getTime()) / (1000 * 60 * 60 * 24 * 30.44));
    const y = Math.floor(months / 12); const m = months % 12;
    if (y > 0 && m > 0) return t("profile.tenure", { years: y, months: m });
    if (y > 0) return t("profile.tenureYears", { years: y });
    return t("profile.tenureMonths", { months: m });
  };

  return (
    <div className="flex flex-col md:flex-row items-start md:items-center gap-4 p-6 border-b">
      <div className="relative">
        <Avatar className="h-20 w-20 cursor-pointer" onClick={() => fileRef.current?.click()}>
          <AvatarImage src={worker.profileImage ?? undefined} />
          <AvatarFallback className="text-lg font-bold">{initials}</AvatarFallback>
        </Avatar>
        <button onClick={() => fileRef.current?.click()} disabled={uploading} className="absolute bottom-0 right-0 h-6 w-6 rounded-full bg-primary text-white flex items-center justify-center">
          <Camera className="h-3 w-3" />
        </button>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
      </div>
      <div className="flex-1">
        <h2 className="text-2xl font-bold">{worker.firstName} {worker.lastName}</h2>
        <p className="text-muted-foreground">{worker.positionTitle ?? "—"} {worker.employeeNumber ? `· #${worker.employeeNumber}` : ""}</p>
        {tenure() && <p className="text-xs text-muted-foreground mt-0.5">{tenure()}</p>}
        <div className="flex items-center gap-2 mt-2 flex-wrap">
          {editing ? (
            <Select value={worker.status} onValueChange={(v) => onChange({ status: v })}>
              <SelectTrigger className="w-36 h-7 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>{STATUSES.map((s) => <SelectItem key={s} value={s}>{t(`status.${s}`)}</SelectItem>)}</SelectContent>
            </Select>
          ) : (
            <Badge className={`text-xs ${STATUS_COLORS[worker.status] ?? ""}`} variant="outline">{t(`status.${worker.status}`)}</Badge>
          )}
          {worker.workerType && <Badge variant="outline" className="text-xs">{t(`workerType.${worker.workerType}`)}</Badge>}
        </div>
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        {editing ? (
          <>
            <Button size="sm" onClick={onSave} disabled={saving}><Save className="h-3 w-3 mr-1" />{t("profile.saveAll")}</Button>
            <Button size="sm" variant="outline" onClick={onDiscard}><X className="h-3 w-3 mr-1" />{t("profile.discard")}</Button>
            <Button size="sm" variant="destructive" onClick={onDelete}><Trash2 className="h-3 w-3 mr-1" />{t("profile.delete")}</Button>
          </>
        ) : (
          <Button size="sm" variant="outline" onClick={onDiscard}>{t("profile.editProfile")}</Button>
        )}
      </div>
    </div>
  );
}