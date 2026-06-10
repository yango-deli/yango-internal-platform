"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useTranslation } from "@/lib/i18n";
import { DashboardWidget } from "../DashboardWidget";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Role } from "@prisma/client";
import type { CompanyAnnouncement } from "@/types/dashboard";
import { Pin, Plus } from "lucide-react";

export function AnnouncementsWidget({ editMode, onRemove }: { editMode?: boolean; onRemove?: () => void }) {
  const { data: session } = useSession();
  const { t } = useTranslation("dashboard");
  const role = session?.user?.role as Role | undefined;

  const [items, setItems] = useState<CompanyAnnouncement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<CompanyAnnouncement | null>(null);

  const canPost = role === "admin" || role === "manager";

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const res = await fetch("/api/dashboard/announcements");
      if (!res.ok) throw new Error("Failed");
      const json = await res.json();
      setItems(json.announcements || []);
    } catch {
      setError(t("widgets.announcements.empty"));
    }
    setLoading(false);
  }, [t]);

  useEffect(() => { load(); }, [load]);

  async function postAnnouncement(data: any) {
    const res = await fetch("/api/dashboard/announcements", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      setModalOpen(false);
      setEditing(null);
      await load();
    }
  }

  const openNew = () => { setEditing(null); setModalOpen(true); };

  return (
    <>
      <DashboardWidget
        title={t("widgets.announcements.title")}
        description={t("widgets.announcements.description")}
        isLoading={loading} error={error} onRetry={load}
        isEmpty={items.length === 0} emptyMessage={t("widgets.announcements.empty")}
        headerAction={canPost ? (
          <Button size="sm" variant="outline" className="h-7 px-2 text-xs" onClick={openNew} disabled={editMode}>
            <Plus className="h-3 w-3 mr-1 rtl:mr-0 rtl:ml-1" /> {t("widgets.announcements.postNew")}
          </Button>
        ) : null}
        editMode={editMode} onRemove={onRemove}
      >
        <div className="space-y-2">
          {items.map((a) => (
            <div key={a.id} className="rounded-lg border border-gray-100 p-2.5 text-sm">
              <div className="flex items-start justify-between gap-2">
                <div className="font-semibold text-gray-900 flex items-center gap-1.5">
                  {a.isPinned && <Pin className="h-3.5 w-3.5 text-amber-500" data-title={t("widgets.announcements.pinnedTooltip")} />}
                  {a.title}
                </div>
                <div className="text-[10px] text-gray-400 whitespace-nowrap">{new Date(a.createdAt).toLocaleDateString()}</div>
              </div>
              <div className="mt-1 text-gray-600 whitespace-pre-line text-xs line-clamp-3">{a.body}</div>
              {a.author && <div className="mt-1 text-[10px] text-gray-500">— {a.author.name || a.author.email}</div>}
            </div>
          ))}
        </div>
      </DashboardWidget>

      {/* Post/Edit Modal */}
      <AnnouncementModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        initial={editing}
        onSave={postAnnouncement}
        t={t}
      />
    </>
  );
}

// Simple inline modal (re-using Dialog)
function AnnouncementModal({ open, onOpenChange, initial, onSave, t }: any) {
  const [title, setTitle] = React.useState("");
  const [body, setBody] = React.useState("");
  const [isPinned, setIsPinned] = React.useState(false);
  const [targetRoles, setTargetRoles] = React.useState<string[]>([]);

  React.useEffect(() => {
    if (initial) {
      setTitle(initial.title || "");
      setBody(initial.body || "");
      setIsPinned(!!initial.isPinned);
      setTargetRoles(initial.targetRoles || []);
    } else {
      setTitle(""); setBody(""); setIsPinned(false); setTargetRoles([]);
    }
  }, [initial, open]);

  async function submit() {
    await onSave({ title, body, isPinned, targetRoles });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{initial ? t("widgets.announcements.modal.editTitle") : t("widgets.announcements.modal.title")}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label>{t("widgets.announcements.modal.fields.title")}</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t("widgets.announcements.modal.fields.titlePlaceholder")} />
          </div>
          <div>
            <Label>{t("widgets.announcements.modal.fields.body")}</Label>
            <Textarea value={body} onChange={(e: any) => setBody(e.target.value)} placeholder={t("widgets.announcements.modal.fields.bodyPlaceholder")} />
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" checked={isPinned} onChange={(e) => setIsPinned(e.target.checked)} id="pin" />
            <Label htmlFor="pin">{t("widgets.announcements.modal.fields.isPinned")}</Label>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>{t("buttons.cancel")}</Button>
          <Button onClick={submit} disabled={!title || !body}>{t("buttons.post")}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
