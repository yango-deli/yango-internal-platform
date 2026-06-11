"use client";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WorkerProfileHeader } from "@/components/hr/WorkerProfileHeader";
import { PersonalTab } from "@/components/hr/tabs/PersonalTab";
import { EmploymentTab } from "@/components/hr/tabs/EmploymentTab";
import { SalaryTab } from "@/components/hr/tabs/SalaryTab";
import { DocumentsTab } from "@/components/hr/tabs/DocumentsTab";
import { EquipmentTab } from "@/components/hr/tabs/EquipmentTab";
import { CareerHistoryTab } from "@/components/hr/tabs/CareerHistoryTab";
import { ActivityTab } from "@/components/hr/tabs/ActivityTab";
import { toast } from "sonner";

const TABS = ["personal","employment","salary","documents","equipment","career","activity"];

export function WorkerProfile({ worker: initialWorker, onUpdate }: { worker: any; onUpdate: () => void }) {
  const { t } = useTranslation("hr");
  const router = useRouter();
  const [worker, setWorker] = useState(initialWorker);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState<Partial<any>>({});

  const handleChange = (patch: Partial<any>) => {
    setWorker((p: any) => ({ ...p, ...patch }));
    setDirty((p) => ({ ...p, ...patch }));
    if (!editing) setEditing(true);
  };

  const handleSave = async () => {
    setSaving(true);
    const res = await fetch(`/api/hr/workers/${worker.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(dirty) });
    if (res.ok) { setEditing(false); setDirty({}); onUpdate(); toast.success(t("profile.saveAll")); }
    else toast.error(t("common.error"));
    setSaving(false);
  };

  const handleDiscard = () => {
    if (editing) { setWorker(initialWorker); setDirty({}); setEditing(false); }
    else setEditing(true);
  };

  const handleDelete = async () => {
    if (!confirm(t("profile.deleteConfirm"))) return;
    const res = await fetch(`/api/hr/workers/${worker.id}`, { method: "DELETE" });
    if (res.ok) router.push("/hr");
    else toast.error(t("common.error"));
  };

  return (
    <div className="border rounded-xl overflow-hidden bg-white">
      <WorkerProfileHeader worker={worker} editing={editing} onChange={handleChange} onSave={handleSave} onDiscard={handleDiscard} onDelete={handleDelete} saving={saving} />
      <Tabs defaultValue="personal" className="p-6">
        <TabsList className="flex flex-wrap gap-1 h-auto mb-6">
          {TABS.map((tab) => <TabsTrigger key={tab} value={tab} className="text-xs">{t(`tabs.${tab}`)}</TabsTrigger>)}
        </TabsList>
        <TabsContent value="personal"><PersonalTab worker={worker} onChange={handleChange} /></TabsContent>
        <TabsContent value="employment"><EmploymentTab worker={worker} onChange={handleChange} /></TabsContent>
        <TabsContent value="salary"><SalaryTab worker={worker} onChange={handleChange} /></TabsContent>
        <TabsContent value="documents"><DocumentsTab workerId={worker.id} /></TabsContent>
        <TabsContent value="equipment"><EquipmentTab workerId={worker.id} /></TabsContent>
        <TabsContent value="career"><CareerHistoryTab workerId={worker.id} worker={worker} /></TabsContent>
        <TabsContent value="activity"><ActivityTab workerId={worker.id} /></TabsContent>
      </Tabs>
    </div>
  );
}