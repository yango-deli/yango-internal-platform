"use client";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Phone, Mail, Building2 } from "lucide-react";

interface Props { worker: any; onUpdate: () => void; }

const STATUS_COLORS: Record<string, string> = {
  active: "bg-green-100 text-green-800",
  inactive: "bg-gray-100 text-gray-700",
  on_leave: "bg-yellow-100 text-yellow-800",
  terminated: "bg-red-100 text-red-800",
};

export function WorkerCard({ worker }: Props) {
  const { t } = useTranslation("hr");
  const router = useRouter();
  const initials = `${worker.firstName[0]}${worker.lastName[0]}`.toUpperCase();

  return (
    <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => router.push(`/hr/${worker.id}`)}>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12">
            <AvatarImage src={worker.profileImage} />
            <AvatarFallback className="bg-primary/10 text-primary font-semibold">{initials}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-semibold truncate">{worker.firstName} {worker.lastName}</p>
            <p className="text-sm text-muted-foreground truncate">{worker.positionTitle ?? "\u2014"}</p>
          </div>
          <Badge className={STATUS_COLORS[worker.status] ?? ""}>{t(`status.${worker.status}`)}</Badge>
        </div>
        <div className="space-y-1.5 text-sm text-muted-foreground">
          {worker.phone && <div className="flex items-center gap-2"><Phone className="h-3.5 w-3.5" /><span>{worker.phone}</span></div>}
          {worker.email && <div className="flex items-center gap-2"><Mail className="h-3.5 w-3.5" /><span className="truncate">{worker.email}</span></div>}
          {(worker.department || worker.store) && (
            <div className="flex items-center gap-2">
              <Building2 className="h-3.5 w-3.5" />
              <span>{worker.department?.name ?? worker.store?.name}</span>
            </div>
          )}
        </div>
        {worker.workerType && (
          <Badge variant="outline" className="text-xs">{t(`workerType.${worker.workerType}`)}</Badge>
        )}
      </CardContent>
    </Card>
  );
}