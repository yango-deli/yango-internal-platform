"use client";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Building2, Phone, Briefcase } from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  active: "bg-green-100 text-green-800",
  inactive: "bg-gray-100 text-gray-600",
  on_leave: "bg-yellow-100 text-yellow-800",
  terminated: "bg-red-100 text-red-800",
};

interface WorkerCardProps { worker: any; onUpdate: () => void; }

export function WorkerCard({ worker }: WorkerCardProps) {
  const { t } = useTranslation("hr");
  const router = useRouter();
  const initials = `${worker.firstName?.[0] ?? ""}${worker.lastName?.[0] ?? ""}`.toUpperCase();

  return (
    <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => router.push(`/hr/${worker.id}`)}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Avatar className="h-12 w-12">
            {worker.profileImage && <AvatarImage src={worker.profileImage} alt={initials} />}
            <AvatarFallback className="text-sm font-semibold">{initials}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <p className="font-semibold text-sm truncate">{worker.firstName} {worker.lastName}</p>
              <Badge className={`text-xs shrink-0 ${STATUS_COLORS[worker.status] ?? ""}`}>{t(`status.${worker.status}`)}</Badge>
            </div>
            {worker.positionTitle && <p className="text-xs text-muted-foreground truncate mt-0.5">{worker.positionTitle}</p>}
            <div className="mt-2 space-y-1">
              {(worker.department || worker.store) && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Building2 className="h-3 w-3 shrink-0" />
                  <span className="truncate">{worker.department?.name ?? worker.store?.name}</span>
                </div>
              )}
              {worker.phone && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Phone className="h-3 w-3 shrink-0" />
                  <span>{worker.phone}</span>
                </div>
              )}
              {worker.workerType && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Briefcase className="h-3 w-3 shrink-0" />
                  <span>{t(`workerType.${worker.workerType}`)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}