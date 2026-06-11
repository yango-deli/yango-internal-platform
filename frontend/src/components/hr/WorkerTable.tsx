"use client";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const STATUS_COLORS: Record<string, string> = {
  active: "bg-green-100 text-green-800",
  inactive: "bg-gray-100 text-gray-600",
  on_leave: "bg-yellow-100 text-yellow-800",
  terminated: "bg-red-100 text-red-800",
};

export function WorkerTable({ workers, onUpdate }: { workers: any[]; onUpdate: () => void }) {
  const { t } = useTranslation("hr");
  const router = useRouter();
  return (
    <div className="border rounded-lg overflow-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t("fields.firstName")}</TableHead>
            <TableHead>{t("fields.phone")}</TableHead>
            <TableHead>{t("fields.status")}</TableHead>
            <TableHead>{t("fields.workerType")}</TableHead>
            <TableHead>{t("fields.positionTitle")}</TableHead>
            <TableHead>{t("fields.department")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {workers.map((w) => {
            const initials = `${w.firstName?.[0] ?? ""}${w.lastName?.[0] ?? ""}`.toUpperCase();
            return (
              <TableRow key={w.id} className="cursor-pointer hover:bg-muted/50" onClick={() => router.push(`/hr/${w.id}`)}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-7 w-7">
                      {w.profileImage && <AvatarImage src={w.profileImage} />}
                      <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                    </Avatar>
                    <span className="font-medium text-sm">{w.firstName} {w.lastName}</span>
                  </div>
                </TableCell>
                <TableCell className="text-sm">{w.phone}</TableCell>
                <TableCell><Badge className={`text-xs ${STATUS_COLORS[w.status] ?? ""}`}>{t(`status.${w.status}`)}</Badge></TableCell>
                <TableCell className="text-sm">{w.workerType ? t(`workerType.${w.workerType}`) : "—"}</TableCell>
                <TableCell className="text-sm">{w.positionTitle ?? "—"}</TableCell>
                <TableCell className="text-sm">{w.department?.name ?? w.store?.name ?? "—"}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}