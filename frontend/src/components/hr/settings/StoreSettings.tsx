"use client";
import { useTranslation } from "next-i18next";
import { useState } from "react";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Plus, Pencil, Check } from "lucide-react";
import { toast } from "sonner";

export function StoreSettings() {
  const { t } = useTranslation("hr");
  const { data: stores, mutate } = useSWR("/api/hr/stores", fetcher);
  const [name, setName] = useState("");
  const [editing, setEditing] = useState<Record<string, string>>({});

  const add = async () => {
    if (!name.trim()) return;
    const res = await fetch("/api/hr/stores", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: name.trim() }) });
    if (res.ok) { mutate(); setName(""); } else toast.error(t("common.error"));
  };

  const update = async (id: string) => {
    const n = editing[id]; if (!n) return;
    const res = await fetch(`/api/hr/stores/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: n }) });
    if (res.ok) { mutate(); setEditing((p) => { const c = { ...p }; delete c[id]; return c; }); }
    else toast.error(t("common.error"));
  };

  const del = async (id: string) => {
    const res = await fetch(`/api/hr/stores/${id}`, { method: "DELETE" });
    if (res.ok) mutate(); else toast.error(t("common.error"));
  };

  return (
    <div className="space-y-3 pt-4">
      <div className="flex gap-2">
        <Input placeholder={t("settings.storeName")} value={name} onChange={(e) => setName(e.target.value)} />
        <Button onClick={add} disabled={!name.trim()}><Plus className="h-4 w-4 mr-1" />{t("settings.addStore")}</Button>
      </div>
      <div className="space-y-2">
        {(stores ?? []).map((s: any) => (
          <div key={s.id} className="flex items-center gap-2 border rounded-lg px-3 py-2">
            {editing[s.id] !== undefined ? (
              <>
                <Input className="h-7 text-sm flex-1" value={editing[s.id]} onChange={(e) => setEditing((p) => ({ ...p, [s.id]: e.target.value }))} />
                <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => update(s.id)}><Check className="h-3 w-3" /></Button>
              </>
            ) : (
              <>
                <span className="flex-1 text-sm">{s.name}</span>
                <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setEditing((p) => ({ ...p, [s.id]: s.name }))}><Pencil className="h-3 w-3" /></Button>
                <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => del(s.id)}><Trash2 className="h-3 w-3" /></Button>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}