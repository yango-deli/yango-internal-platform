"use client";
import { useState } from "react";
import { useTranslation } from "next-i18next";
import { useSession } from "next-auth/react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { WorkerProfileHeader } from "./WorkerProfileHeader";
import { PersonalTab } from "./tabs/PersonalTab";
import { EmploymentTab } from "./tabs/EmploymentTab";
import { SalaryTab } from "./tabs/SalaryTab";
import { DocumentsTab } from "./tabs/DocumentsTab";
import { EquipmentTab } from "./tabs/EquipmentTab";
import { CareerHistoryTab } from "./tabs/CareerHistoryTab";
import { ActivityTab } from "./tabs/ActivityTab";
import { Save, X } from "lucide-react";
import { toast } from "sonner";

interface Props { worker: any; onUpdate: () => void; }

export function WorkerProfile({ worker, onUpdate }: Props) {
  const { t } = useTranslation("hr");
  const { data: session } = useSession();
  const role = (session?.user as any)?.role;
  const canEdit = ["admin","manager"].includes(role);
  const [draft, setDraft] = useState<Record<string, any>>({});
  const isDirty = Object.keys(draft).length > 0;

  const handleChange = (field: string, value: any) => setDraft((d) => ({ ...d, [field]: value }));

  const handleSave = async () => {
    const res = await fetch(`/api/hr/workers/${worker.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(draft),
    });
    if (res.ok) { toast.success(t("save")); setDraft({}); onUpdate(); }
    else toast.error(t("common.error"));
  };

  const merged = { ...worker, ...draft };

  return (
    <div className="space-y-4">
      <WorkerProfileHeader worker={merged} onUpdate={onUpdate} />
      {isDirty && canEdit && (
        <div className="sticky top-16 z-10 flex items-center gap-2 rounded-lg border bg-background/95 backdrop-blur p-3 shadow">
          <span className="text-sm text-muted-foreground flex-1">{t("save")}</span>
          <Button size="sm" variant="outline" onClick={() => setDraft({})}><X className="h-4 w-4 mr-1" />{t("discard")}</Button>
          <Button size="sm" onClick={handleSave}><Save className="h-4 w-4 mr-1" />{t("save")}</Button>
        </div>
      )}
      <Tabs defaultValue="personal">
        <TabsList className="flex-wrap h-auto">
          {["personal","employment","salary","documents","equipment","career","activity"].map((tab) => (
            <TabsTrigger key={tab} value={tab}>{t(`tabs.${tab}`)}</TabsTrigger>
          ))}
        </TabsList>
        <TabsContent value="personal"><PersonalTab worker={merged} onChange={handleChange} canEdit={canEdit} /></TabsContent>
        <TabsContent value="employment"><EmploymentTab worker={merged} onChange={handleChange} canEdit={canEdit} /></TabsContent>
        <TabsContent value="salary"><SalaryTab worker={merged} onChange={handleChange} canEdit={canEdit} /></TabsContent>
        <TabsContent value="documents"><DocumentsTab workerId={worker.id} /></TabsContent>
        <TabsContent value="equipment"><EquipmentTab workerId={worker.id} /></TabsContent>
        <TabsContent value="career"><CareerHistoryTab worker={merged} onChange={handleChange} canEdit={canEdit} /></TabsContent>
        <TabsContent value="activity"><ActivityTab workerId={worker.id} /></TabsContent>
      </Tabs>
    </div>
  );
}