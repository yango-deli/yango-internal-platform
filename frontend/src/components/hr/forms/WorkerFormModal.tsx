"use client";
import { useTranslation } from "next-i18next";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function WorkerFormModal({ open, onClose, onSuccess }: { open: boolean; onClose: () => void; onSuccess: () => void }) {
  const { t } = useTranslation("hr");
  const [form, setForm] = useState({ firstName: "", lastName: "", phone: "" });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    if (!form.firstName || !form.lastName || !form.phone) return;
    setSaving(true);
    try {
      const res = await fetch("/api/hr/workers", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      if (!res.ok) throw new Error();
      onSuccess();
    } catch { toast.error(t("common.error")); }
    finally { setSaving(false); }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader><DialogTitle>{t("addWorker")}</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">{t("fields.firstName")}</Label>
              <Input value={form.firstName} onChange={(e) => setForm((p) => ({ ...p, firstName: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">{t("fields.lastName")}</Label>
              <Input value={form.lastName} onChange={(e) => setForm((p) => ({ ...p, lastName: e.target.value }))} />
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">{t("fields.phone")}</Label>
            <Input value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>{t("common.cancel")}</Button>
            <Button onClick={handleSubmit} disabled={saving || !form.firstName || !form.lastName || !form.phone}>
              {saving ? t("common.loading") : t("common.save")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}