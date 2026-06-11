"use client";
import { useTranslation } from "next-i18next";
import { useState, useEffect } from "react";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

const FIELD_KEYS = ["personal","employment","salary","documents","equipment","career","activity"];
const ROLES = ["admin","manager","hr","viewer"];

export function PermissionsMatrix() {
  const { t } = useTranslation("hr");
  const { data: raw, mutate } = useSWR("/api/hr/settings/permissions", fetcher);
  const [matrix, setMatrix] = useState<Record<string, { canView: boolean; canEdit: boolean }>>({});

  useEffect(() => {
    if (!raw) return;
    const m: typeof matrix = {};
    for (const r of raw) m[`${r.fieldKey}__${r.role}`] = { canView: r.canView, canEdit: r.canEdit };
    setMatrix(m);
  }, [raw]);

  const toggle = (fk: string, role: string, prop: "canView" | "canEdit") => {
    const key = `${fk}__${role}`;
    setMatrix((p) => ({ ...p, [key]: { ...(p[key] ?? { canView: true, canEdit: false }), [prop]: !(p[key]?.[prop]) } }));
  };

  const save = async () => {
    const updates = Object.entries(matrix).map(([key, v]) => {
      const [fieldKey, role] = key.split("__");
      return { fieldKey, role, ...v };
    });
    const res = await fetch("/api/hr/settings/permissions", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(updates) });
    if (res.ok) { mutate(); toast.success(t("settings.savePermissions")); }
    else toast.error(t("common.error"));
  };

  return (
    <div className="space-y-4 pt-4">
      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead className="bg-muted/40">
            <tr>
              <th className="text-left px-4 py-3 font-medium">{t("settings.fieldKey")}</th>
              {ROLES.map((r) => (
                <th key={r} colSpan={2} className="text-center px-4 py-3 font-medium capitalize">{r}</th>
              ))}
            </tr>
            <tr>
              <th />
              {ROLES.map((r) => (
                <>
                  <th key={`${r}-v`} className="text-center px-2 py-2 text-xs text-muted-foreground">{t("settings.canView")}</th>
                  <th key={`${r}-e`} className="text-center px-2 py-2 text-xs text-muted-foreground">{t("settings.canEdit")}</th>
                </>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y">
            {FIELD_KEYS.map((fk) => (
              <tr key={fk}>
                <td className="px-4 py-3 font-medium">{t(`tabs.${fk}`)}</td>
                {ROLES.map((role) => {
                  const key = `${fk}__${role}`;
                  const v = matrix[key] ?? { canView: true, canEdit: false };
                  return (
                    <>
                      <td key={`${key}-v`} className="text-center px-2 py-3">
                        <Checkbox checked={v.canView} onCheckedChange={() => toggle(fk, role, "canView")} />
                      </td>
                      <td key={`${key}-e`} className="text-center px-2 py-3">
                        <Checkbox checked={v.canEdit} onCheckedChange={() => toggle(fk, role, "canEdit")} />
                      </td>
                    </>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex justify-end">
        <Button onClick={save}>{t("settings.savePermissions")}</Button>
      </div>
    </div>
  );
}