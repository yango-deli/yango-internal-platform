"use client";

import { useI18n } from "@/components/providers/i18n-provider";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function RecruiterTable({
  data,
}: {
  data: Array<{
    recruiter: { name: string | null; email: string };
    total: number;
    hired: number;
    conversionRate: number;
  }>;
}) {
  const { t } = useI18n();

  return (
    <div className="rounded-xl border bg-white overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t("stats.recruiter")}</TableHead>
            <TableHead>{t("stats.candidates")}</TableHead>
            <TableHead>{t("stats.hired")}</TableHead>
            <TableHead>{t("stats.conversionRate")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row) => (
            <TableRow key={row.recruiter.email}>
              <TableCell>{row.recruiter.name ?? row.recruiter.email}</TableCell>
              <TableCell>{row.total}</TableCell>
              <TableCell>{row.hired}</TableCell>
              <TableCell>{row.conversionRate}%</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
