"use client";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Building2, Phone, Briefcase } from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  active: "bg-green-100 text-green-800",
  inactive: "bg-gray-100 text-gray-600",
  on_leave: "bg-yellow-100 text-yellow-800",
  terminated: "bg-red-100 text-red-800",
};

export function WorkerCard({ worker, onUpdate }: { worker: any; onUpdate?: () => void }) {
  const { t } = useTranslation("hr");
  const router = useRouter();
  const initials = `${worker.firstName?.[0] ?? ""}${worker.lastName?.[0] ?? ""}`.toUpperCase();

  return (
    <div
      className="border rounded-xl p-4 hover:shadow-md transition-shadow cursor-pointer bg-white space-y-3"
      onClick={() => router.push(`/hr/${worker.id}`)}
    >
      <div className="flex items-start gap-3">
        <Avatar className="h-12 w-12 shrink-0">
          <AvatarImage src={worker.profileImage ?? undefined} />
          <AvatarFallback className="text-sm font-semibold">{initials}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="font-semibold truncate">{worker.firstName} {worker.lastName}</p>
          <p className="text-xs text-muted-foreground truncate">{worker.positionTitle ?? t("workerType." + (worker.workerType ?? "office"))}</p>
          <Badge className={`text-xs mt-1 ${STATUS_COLORS[worker.status] ?? ""}`} variant="outline">
            {t(`status.${worker.status}`)}
          </Badge>
        </div>
      </div>
      <div className="space-y-1 text-xs text-muted-foreground">
        {worker.phone && (
          <div className="flex items-center gap-1.5"><Phone className="h-3 w-3" /><span>{worker.phone}</span></div>
        )}
        {(worker.department?.name || worker.store?.name) && (
          <div className="flex items-center gap-1.5"><Building2 className="h-3 w-3" /><span>{worker.department?.name ?? worker.store?.name}</span></div>
        )}
        {worker.employeeNumber && (
          <div className="flex items-center gap-1.5"><Briefcase className="h-3 w-3" /><span>#{worker.employeeNumber}</span></div>
        )}
      </div>
    </div>
  );
}