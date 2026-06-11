"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Role } from "@prisma/client";
import { WIDGET_DEFINITIONS } from "@/lib/widgets/registry";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function AdminSettingsPage() {
  const { data: session } = useSession();
  const role = session?.user?.role as Role;
  const [enabled, setEnabled] = useState<string[]>([]);
  const [aiProviders, setAiProviders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const isAdmin = role === "admin";

  useEffect(() => {
    async function load() {
      try {
        const [feat, ai] = await Promise.all([
          fetch("/api/admin/features").then(r => r.ok ? r.json() : { enabledWidgets: [] }),
          fetch("/api/admin/ai-providers").then(r => r.ok ? r.json() : { providers: [] }),
        ]);
        setEnabled(feat.enabledWidgets || WIDGET_DEFINITIONS.map(w => w.key));
        setAiProviders(ai.providers || []);
      } catch {}
      setLoading(false);
    }
    load();
  }, []);

  if (!isAdmin) {
    return <div className="p-8 text-red-600">Admin access only.</div>;
  }

  async function toggleWidget(key: string) {
    const next = enabled.includes(key)
      ? enabled.filter(k => k !== key)
      : [...enabled, key];
    setEnabled(next);
    await fetch("/api/admin/features", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ enabledWidgets: next }),
    });
  }

  return (
    <div className="max-w-5xl space-y-8">
      <h1 className="text-2xl font-semibold">Admin Settings — Platform &amp; Features</h1>

      <Card>
        <CardHeader><CardTitle>Manage Available Widgets / Elements</CardTitle></CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 mb-4">
            Toggle which widgets users can add to their workspace. New widgets added in code appear here automatically.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {WIDGET_DEFINITIONS.map((def) => (
              <div key={def.key} className="flex items-center justify-between border rounded p-3">
                <div>
                  <div className="font-medium">{def.key}</div>
                  <div className="text-xs text-gray-500">{def.category} • {def.roles.join(", ")}</div>
                </div>
                <Button
                  variant={enabled.includes(def.key) ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleWidget(def.key)}
                >
                  {enabled.includes(def.key) ? "Enabled" : "Disabled"}
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>AI Providers (set API connections here)</CardTitle></CardHeader>
        <CardContent>
          <div className="text-sm mb-3">Configure providers. "isSecure" marks them as the Secure AI option for users.</div>
          <div className="space-y-2">
            {aiProviders.length === 0 && <div className="text-gray-500 text-sm">No providers configured yet (demo). Add via API or DB.</div>}
            {aiProviders.map((p: any, idx: number) => (
              <div key={idx} className="border p-3 rounded text-sm flex justify-between">
                <div>{p.provider} — {p.isSecure ? "Secure" : "External"} — {p.isEnabled ? "Enabled" : "Disabled"}</div>
              </div>
            ))}
          </div>
          <p className="text-xs mt-4 text-gray-500">
            In production store keys securely (env / vault). UI here lets admins add/edit providers for the Ask AI bar.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Integrations Catalog</CardTitle></CardHeader>
        <CardContent>
          <p className="text-sm">Microsoft platforms are auto-integrated via Entra SSO at login (scopes in auth.ts).</p>
          <p className="text-xs mt-2 text-gray-500">Future: manage OAuth for Google Workspace, Slack, CRM connectors here.</p>
        </CardContent>
      </Card>
    </div>
  );
}
