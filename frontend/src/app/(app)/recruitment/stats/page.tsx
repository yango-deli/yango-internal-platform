"use client";

import useSWR from "swr";
import { useI18n } from "@/components/providers/i18n-provider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FunnelChart } from "@/components/recruitment/stats/FunnelChart";
import { LeadsBySourceChart } from "@/components/recruitment/stats/LeadsBySourceChart";
import { RecruiterTable } from "@/components/recruitment/stats/RecruiterTable";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function RecruitmentStatsPage() {
  const { t } = useI18n();
  const { data, isLoading } = useSWR("/api/recruitment/stats", fetcher);

  if (isLoading || !data) {
    return <div className="h-96 animate-pulse bg-gray-100 rounded-xl" />;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">{t("stats.title")}</h1>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("stats.funnel")}</CardTitle>
          </CardHeader>
          <CardContent>
            <FunnelChart data={data.funnel} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("stats.leadsBySource")}</CardTitle>
          </CardHeader>
          <CardContent>
            <LeadsBySourceChart data={data.leadsByWeek ?? []} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("stats.recruiterPerformance")}</CardTitle>
        </CardHeader>
        <CardContent>
          <RecruiterTable data={data.recruiterPerformance ?? []} />
        </CardContent>
      </Card>
    </div>
  );
}
