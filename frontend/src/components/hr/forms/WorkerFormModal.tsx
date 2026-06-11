"use client";
import { useTranslation } from "next-i18next";
import { useForm } from "react-hook-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

interface Props { open: boolean; onClose: () => void; onSuccess: () => void; }

export default function WorkerFormModal({ open, onClose, onSuccess }: Props) {
  const { t } = useTranslation("hr");
  const { register, handleSubmit, setValue, reset } = useForm<any>();

  const onSubmit = async (data: any) => {
    const res = await fetch("/api/hr/workers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      toast.success(t("addWorker"));
      reset();
      onSuccess();
    } else {
      toast.error(t("common.error"));
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>{t("addWorker")}</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>{t("fields.firstName")} *</Label>
              <Input {...register("firstName", { required: true })} />
            </div>
            <div>
              <Label>{t("fields.lastName")} *</Label>
              <Input {...register("lastName", { required: true })} />
            </div>
          </div>
          <div>
            <Label>{t("fields.phone")} *</Label>
            <Input {...register("phone", { required: true })} />
          </div>
          <div>
            <Label>{t("fields.workerType")}</Label>
            <Select onValueChange={(v) => setValue("workerType", v)}>
              <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
              <SelectContent>
                {["office", "store", "courier"].map((tp) => (
                  <SelectItem key={tp} value={tp}>{t(`workerType.${tp}`)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>{t("common.cancel")}</Button>
            <Button type="submit">{t("common.save")}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}