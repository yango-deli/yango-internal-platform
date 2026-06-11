"use client";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";

const STATUS_COLORS: Record<string, string> = {
  active: "bg-green-100 text-green-800",
  inactive: "bg-gray-100 text-gray-600",
  on_leave: "bg-yellow-100 text-yellow-800",
  terminated: "bg-red-100 text-red-800",
};

export function WorkerTable({ workers, onUpdate }: { workers: any[]; onUpdate?: () => void }) {
  const { t } = useTranslation("hr");
  const router = useRouter();

  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full text-sm">
        <thead className="bg-muted/40">
          <tr>
            {["fields.firstName","fields.employeeNumber","fields.positionTitle","fields.status","fields.workerType","fields.department","fields.phone"].map((k) => (
              <th key={k} className="text-left px-4 py-3 font-medium text-muted-foreground">{t(k)}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y">
          {workers.map((w) => (
            <tr key={w.id} className="hover:bg-muted/20 cursor-pointer" onClick={() => router.push(`/hr/${w.id}`)}>
              <td className="px-4 py-3 font-medium">{w.firstName} {w.lastName}</td>
              <td className="px-4 py-3 text-muted-foreground">{w.employeeNumber ?? "—"}</td>
              <td className="px-4 py-3">{w.positionTitle ?? "—"}</td>
              <td className="px-4 py-3">
                <Badge className={`text-xs ${STATUS_COLORS[w.status] ?? ""}`} variant="outline">
                  {t(`status.${w.status}`)}
                </Badge>
              </td>
              <td className="px-4 py-3">{w.workerType ? t(`workerType.${w.workerType}`) : "—"}</td>
              <td className="px-4 py-3">{w.department?.name ?? w.store?.name ?? "—"}</td>
              <td className="px-4 py-3">{w.phone}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}