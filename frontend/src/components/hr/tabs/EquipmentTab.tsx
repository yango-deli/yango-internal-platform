"use client";
import { useTranslation } from "next-i18next";
import { useState } from "react";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Package } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

export function EquipmentTab({ workerId }: { workerId: string }) {
  const { t } = useTranslation("hr");
  const { data: equipment, mutate } = useSWR(`/api/hr/workers/${workerId}/equipment`, fetcher);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", serialNumber: "", assignedDate: "" });

  const submit = async () => {
    const res = await fetch(`/api/hr/workers/${workerId}/equipment`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    if (res.ok) { mutate(); setOpen(false); setForm({ name: "", description: "", serialNumber: "", assignedDate: "" }); }
    else toast.error(t("common.error"));
  };

  return (
    <div className="space-y-3">
      <div className="flex justify-end"><Button size="sm" onClick={() => setOpen(true)}><Plus className="h-3 w-3 mr-1" />{t("equipment.assign")}</Button></div>
      {!(equipment?.length) ? (
        <div className="text-center py-10 text-muted-foreground"><Package className="h-8 w-8 mx-auto mb-2 opacity-40" /><p className="text-sm">{t("equipment.noEquipment")}</p></div>
      ) : (
        <div className="space-y-2">
          {(equipment ?? []).map((eq: any) => (
            <div key={eq.id} className="border rounded-lg p-3 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">{eq.name}</p>
                {eq.serialNumber && <p className="text-xs text-muted-foreground">{eq.serialNumber}</p>}
                {eq.assignedDate && <p className="text-xs text-muted-foreground">{format(new Date(eq.assignedDate), "dd/MM/yyyy")}</p>}
              </div>
              <Badge variant="outline" className="text-xs">{t(`equipment.status.${eq.status}`)}</Badge>
            </div>
          ))}
        </div>
      )}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{t("equipment.assign")}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1"><Label className="text-xs">{t("equipment.name")}</Label><Input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} /></div>
            <div className="space-y-1"><Label className="text-xs">{t("equipment.description")}</Label><Input value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} /></div>
            <div className="space-y-1"><Label className="text-xs">{t("equipment.serialNumber")}</Label><Input value={form.serialNumber} onChange={(e) => setForm((p) => ({ ...p, serialNumber: e.target.value }))} /></div>
            <div className="space-y-1"><Label className="text-xs">{t("equipment.assignedDate")}</Label><Input type="date" value={form.assignedDate} onChange={(e) => setForm((p) => ({ ...p, assignedDate: e.target.value }))} /></div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setOpen(false)}>{t("common.cancel")}</Button>
              <Button onClick={submit} disabled={!form.name}>{t("common.save")}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}