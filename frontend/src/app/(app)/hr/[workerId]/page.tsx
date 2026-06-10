"use client";
import { useParams, useRouter } from "next/navigation";
import { useTranslation } from "next-i18next";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import { WorkerProfile } from "@/components/hr/WorkerProfile";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function WorkerProfilePage() {
  const { workerId } = useParams<{ workerId: string }>();
  const { t, i18n } = useTranslation("hr");
  const router = useRouter();
  const isRTL = i18n.language === "he";
  const { data: worker, mutate, error } = useSWR(`/api/hr/workers/${workerId}`, fetcher);

  if (error) return <p className="p-6 text-red-500">{t("common.error")}</p>;
  if (!worker) return <p className="p-6 text-muted-foreground">{t("common.loading")}</p>;

  return (
    <div dir={isRTL ? "rtl" : "ltr"} className="p-6 space-y-4">
      <Button variant="ghost" size="sm" onClick={() => router.push("/hr")}>
        <ArrowLeft className="h-4 w-4 mr-2" />{t("common.back")}
      </Button>
      <WorkerProfile worker={worker} onUpdate={mutate} />
    </div>
  );
}