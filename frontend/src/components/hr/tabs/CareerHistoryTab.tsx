"use client";
import { useTranslation } from "next-i18next";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, GripVertical } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

export function CareerHistoryTab({ workerId, worker }: { workerId: string; worker: any }) {
  const { t } = useTranslation("hr");
  const [positions, setPositions] = useState<any[]>(worker.previousPositions ?? []);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ positionTitle: "", department: "", startDate: "", endDate: "", notes: "" });

  const add = async () => {
    const newPos = { ...form, id: crypto.randomUUID(), order: positions.length };
    const all = [...positions, newPos];
    const res = await fetch(`/api/hr/workers/${workerId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ previousPositions: all }) });
    if (res.ok) { setPositions(all); setAdding(false); setForm({ positionTitle: "", department: "", startDate: "", endDate: "", notes: "" }); }
    else toast.error(t("common.error"));
  };

  return (
    <div className="space-y-3">
      <div className="flex justify-end"><Button size="sm" onClick={() => setAdding(true)}><Plus className="h-3 w-3 mr-1" />{t("career.addPosition")}</Button></div>
      {!positions.length && !adding && <p className="text-center text-sm text-muted-foreground py-10">{t("career.noHistory")}</p>}
      {adding && (
        <div className="border rounded-lg p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1 col-span-2"><Label className="text-xs">{t("career.positionTitle")}</Label><Input value={form.positionTitle} onChange={(e) => setForm((p) => ({ ...p, positionTitle: e.target.value }))} /></div>
            <div className="space-y-1 col-span-2"><Label className="text-xs">{t("career.department")}</Label><Input value={form.department} onChange={(e) => setForm((p) => ({ ...p, department: e.target.value }))} /></div>
            <div className="space-y-1"><Label className="text-xs">{t("career.startDate")}</Label><Input type="date" value={form.startDate} onChange={(e) => setForm((p) => ({ ...p, startDate: e.target.value }))} /></div>
            <div className="space-y-1"><Label className="text-xs">{t("career.endDate")}</Label><Input type="date" value={form.endDate} onChange={(e) => setForm((p) => ({ ...p, endDate: e.target.value }))} /></div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setAdding(false)}>{t("common.cancel")}</Button>
            <Button size="sm" onClick={add} disabled={!form.positionTitle}>{t("common.save")}</Button>
          </div>
        </div>
      )}
      <div className="space-y-2">
        {positions.map((pos) => (
          <div key={pos.id} className="border rounded-lg p-3 flex items-start gap-3">
            <GripVertical className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium">{pos.positionTitle}</p>
              {pos.department && <p className="text-xs text-muted-foreground">{pos.department}</p>}
              <p className="text-xs text-muted-foreground">{pos.startDate ? format(new Date(pos.startDate), "MM/yyyy") : ""}{pos.endDate ? ` — ${format(new Date(pos.endDate), "MM/yyyy")}` : ""}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}