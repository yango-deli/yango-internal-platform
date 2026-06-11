"use client";
import { useTranslation } from "next-i18next";
import { useRef, useState } from "react";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Upload, FileText, ExternalLink, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

const DOC_TYPES = ["contract","form101","idCopy","nda","certificates","vehicleLicense","drivingLicense","other"];

export function DocumentsTab({ workerId }: { workerId: string }) {
  const { t } = useTranslation("hr");
  const { data: docs, mutate } = useSWR(`/api/hr/workers/${workerId}/documents`, fetcher);
  const [uploading, setUploading] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const refs = useRef<Record<string, HTMLInputElement | null>>({});

  const upload = async (type: string, file: File, replacesId?: string) => {
    setUploading(type);
    const fd = new FormData();
    fd.append("file", file); fd.append("type", type); fd.append("title", t(`documents.${type}`));
    if (replacesId) fd.append("replacesId", replacesId);
    const res = await fetch(`/api/hr/workers/${workerId}/documents`, { method: "POST", body: fd });
    if (res.ok) { mutate(); toast.success(t(`documents.${type}`)); }
    else toast.error(t("common.error"));
    setUploading(null);
  };

  return (
    <div className="space-y-3">
      {DOC_TYPES.map((type) => {
        const allDocs = (docs ?? []).filter((d: any) => d.type === type);
        const latest = allDocs.find((d: any) => d.isLatest);
        const prev = allDocs.filter((d: any) => !d.isLatest);
        return (
          <div key={type} className="border rounded-lg p-4 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">{t(`documents.${type}`)}</span>
                {latest && <Badge variant="outline" className="text-xs">v{latest.version}</Badge>}
              </div>
              <div className="flex items-center gap-2">
                {latest && <a href={latest.fileUrl} target="_blank" rel="noopener noreferrer"><Button size="icon" variant="ghost" className="h-7 w-7"><ExternalLink className="h-3 w-3" /></Button></a>}
                <Button size="sm" variant="outline" disabled={uploading === type} onClick={() => refs.current[type]?.click()}>
                  <Upload className="h-3 w-3 mr-1" />
                  {uploading === type ? t("documents.uploading") : t("documents.uploadFile")}
                </Button>
                <input ref={(el) => { refs.current[type] = el; }} type="file" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) upload(type, f, latest?.id); }} />
              </div>
            </div>
            {!latest && <p className="text-xs text-muted-foreground">{t("documents.noDocument")}</p>}
            {latest && (
              <p className="text-xs text-muted-foreground">
                {latest.fileName} · {latest.uploadedBy?.name ? `${t("documents.uploadedBy")} ${latest.uploadedBy.name} · ` : ""}{format(new Date(latest.createdAt), "dd/MM/yyyy")}
              </p>
            )}
            {prev.length > 0 && (
              <div>
                <button className="text-xs text-muted-foreground flex items-center gap-1" onClick={() => setExpanded((x) => ({ ...x, [type]: !x[type] }))}>
                  <ChevronDown className={`h-3 w-3 transition-transform ${expanded[type] ? "rotate-180" : ""}`} />
                  {t("documents.previousVersions")} ({prev.length})
                </button>
                {expanded[type] && prev.map((d: any) => (
                  <div key={d.id} className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
                    <span>v{d.version} · {d.fileName}</span>
                    <a href={d.fileUrl} target="_blank" rel="noopener noreferrer" className="underline">{t("documents.uploadFile")}</a>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}