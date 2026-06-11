"use client";
import { useTranslation } from "next-i18next";
import { useState } from "react";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Plus, Pencil, Check } from "lucide-react";
import { toast } from "sonner";

export function DepartmentSettings() {
  const { t } = useTranslation("hr");
  const { data: departments, mutate } = useSWR("/api/hr/departments", fetcher);
  const [name, setName] = useState("");
  const [editing, setEditing] = useState<Record<string, string>>({});

  const add = async () => {
    if (!name.trim()) return;
    const res = await fetch("/api/hr/departments", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: name.trim() }) });
    if (res.ok) { mutate(); setName(""); } else toast.error(t("common.error"));
  };

  const update = async (id: string) => {
    const n = editing[id]; if (!n) return;
    const res = await fetch(`/api/hr/departments/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: n }) });
    if (res.ok) { mutate(); setEditing((p) => { const c = { ...p }; delete c[id]; return c; }); }
    else toast.error(t("common.error"));
  };

  const del = async (id: string) => {
    const res = await fetch(`/api/hr/departments/${id}`, { method: "DELETE" });
    if (res.ok) mutate(); else toast.error(t("common.error"));
  };

  return (
    <div className="space-y-3 pt-4">
      <div className="flex gap-2">
        <Input placeholder={t("settings.departmentName")} value={name} onChange={(e) => setName(e.target.value)} />
        <Button onClick={add} disabled={!name.trim()}><Plus className="h-4 w-4 mr-1" />{t("settings.addDepartment")}</Button>
      </div>
      <div className="space-y-2">
        {(departments ?? []).map((d: any) => (
          <div key={d.id} className="flex items-center gap-2 border rounded-lg px-3 py-2">
            {editing[d.id] !== undefined ? (
              <>
                <Input className="h-7 text-sm flex-1" value={editing[d.id]} onChange={(e) => setEditing((p) => ({ ...p, [d.id]: e.target.value }))} />
                <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => update(d.id)}><Check className="h-3 w-3" /></Button>
              </>
            ) : (
              <>
                <span className="flex-1 text-sm">{d.name}</span>
                <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setEditing((p) => ({ ...p, [d.id]: d.name }))}><Pencil className="h-3 w-3" /></Button>
                <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => del(d.id)}><Trash2 className="h-3 w-3" /></Button>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}