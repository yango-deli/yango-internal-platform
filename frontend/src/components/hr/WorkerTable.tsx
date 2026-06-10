"use client";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Props { workers: any[]; onUpdate: () => void; }

const STATUS_COLORS: Record<string, string> = {
  active: "bg-green-100 text-green-800",
  inactive: "bg-gray-100 text-gray-700",
  on_leave: "bg-yellow-100 text-yellow-800",
  terminated: "bg-red-100 text-red-800",
};

export function WorkerTable({ workers }: Props) {
  const { t } = useTranslation("hr");
  const router = useRouter();
  return (
    <div className="rounded-md border overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t("fields.firstName")}</TableHead>
            <TableHead>{t("fields.phone")}</TableHead>
            <TableHead>{t("fields.positionTitle")}</TableHead>
            <TableHead>{t("fields.department")}</TableHead>
            <TableHead>{t("fields.workerType")}</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {workers.map((w) => (
            <TableRow key={w.id} className="cursor-pointer hover:bg-muted/50" onClick={() => router.push(`/hr/${w.id}`)}>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Avatar className="h-7 w-7">
                    <AvatarImage src={w.profileImage} />
                    <AvatarFallback className="text-xs">{w.firstName[0]}{w.lastName[0]}</AvatarFallback>
                  </Avatar>
                  <span className="font-medium">{w.firstName} {w.lastName}</span>
                </div>
              </TableCell>
              <TableCell>{w.phone}</TableCell>
              <TableCell>{w.positionTitle ?? "\u2014"}</TableCell>
              <TableCell>{w.department?.name ?? w.store?.name ?? "\u2014"}</TableCell>
              <TableCell>{w.workerType ? t(`workerType.${w.workerType}`) : "\u2014"}</TableCell>
              <TableCell><Badge className={STATUS_COLORS[w.status]}>{t(`status.${w.status}`)}</Badge></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}