"use client";
import { useTranslation } from "next-i18next";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WorkerProfileHeader } from "./WorkerProfileHeader";
import { PersonalTab } from "./tabs/PersonalTab";
import { EmploymentTab } from "./tabs/EmploymentTab";
import { SalaryTab } from "./tabs/SalaryTab";
import { DocumentsTab } from "./tabs/DocumentsTab";
import { EquipmentTab } from "./tabs/EquipmentTab";
import { CareerHistoryTab } from "./tabs/CareerHistoryTab";
import { ActivityTab } from "./tabs/ActivityTab";
import { toast } from "sonner";

interface Props { worker: any; onUpdate: () => void; }

export function WorkerProfile({ worker: initialWorker, onUpdate }: Props) {
  const { t } = useTranslation("hr");
  const [worker, setWorker] = useState(initialWorker);
  const [draft, setDraft] = useState<Partial<typeof initialWorker>>({});
  const editing = Object.keys(draft).length > 0;

  const updateDraft = (fields: Record<string, any>) => setDraft((prev) => ({ ...prev, ...fields }));

  const handleSave = async () => {
    try {
      const res = await fetch(`/api/hr/workers/${worker.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft),
      });
      if (!res.ok) throw new Error();
      const updated = await res.json();
      setWorker(updated);
      setDraft({});
      onUpdate();
      toast.success(t("profile.saveAll"));
    } catch {
      toast.error(t("common.error"));
    }
  };

  const handleDiscard = () => { setDraft({}); setWorker(initialWorker); };
  const merged = { ...worker, ...draft };

  return (
    <div className="space-y-6">
      <WorkerProfileHeader worker={merged} editing={editing} onSave={handleSave} onDiscard={handleDiscard} onWorkerUpdate={setWorker} />
      <Tabs defaultValue="personal">
        <TabsList className="flex-wrap">
          <TabsTrigger value="personal">{t("tabs.personal")}</TabsTrigger>
          <TabsTrigger value="employment">{t("tabs.employment")}</TabsTrigger>
          <TabsTrigger value="salary">{t("tabs.salary")}</TabsTrigger>
          <TabsTrigger value="documents">{t("tabs.documents")}</TabsTrigger>
          <TabsTrigger value="equipment">{t("tabs.equipment")}</TabsTrigger>
          <TabsTrigger value="career">{t("tabs.career")}</TabsTrigger>
          <TabsTrigger value="activity">{t("tabs.activity")}</TabsTrigger>
        </TabsList>
        <TabsContent value="personal"><PersonalTab worker={merged} onChange={updateDraft} /></TabsContent>
        <TabsContent value="employment"><EmploymentTab worker={merged} onChange={updateDraft} /></TabsContent>
        <TabsContent value="salary"><SalaryTab worker={merged} onChange={updateDraft} /></TabsContent>
        <TabsContent value="documents"><DocumentsTab workerId={worker.id} /></TabsContent>
        <TabsContent value="equipment"><EquipmentTab workerId={worker.id} /></TabsContent>
        <TabsContent value="career"><CareerHistoryTab workerId={worker.id} positions={merged.previousPositions ?? []} /></TabsContent>
        <TabsContent value="activity"><ActivityTab workerId={worker.id} /></TabsContent>
      </Tabs>
    </div>
  );
}