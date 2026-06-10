"use client";
import { useTranslation } from "next-i18next";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DepartmentSettings } from "@/components/hr/settings/DepartmentSettings";
import { StoreSettings } from "@/components/hr/settings/StoreSettings";
import { PermissionsMatrix } from "@/components/hr/settings/PermissionsMatrix";

export default function HRSettingsPage() {
  const { t, i18n } = useTranslation("hr");
  const isRTL = i18n.language === "he";
  return (
    <div dir={isRTL ? "rtl" : "ltr"} className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">{t("settings.title")}</h1>
      <Tabs defaultValue="departments">
        <TabsList>
          <TabsTrigger value="departments">{t("settings.departments")}</TabsTrigger>
          <TabsTrigger value="stores">{t("settings.stores")}</TabsTrigger>
          <TabsTrigger value="permissions">{t("settings.permissions")}</TabsTrigger>
        </TabsList>
        <TabsContent value="departments"><DepartmentSettings /></TabsContent>
        <TabsContent value="stores"><StoreSettings /></TabsContent>
        <TabsContent value="permissions"><PermissionsMatrix /></TabsContent>
      </Tabs>
    </div>
  );
}