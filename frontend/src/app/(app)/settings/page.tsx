"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useTranslation } from "@/lib/i18n";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export default function UserSettingsPage() {
  const { data: session } = useSession();
  const { t } = useTranslation("common");
  const [settings, setSettings] = useState<any>(null);
  const [integrations, setIntegrations] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      const [s, i] = await Promise.all([
        fetch("/api/dashboard/settings").then(r => r.json()),
        fetch("/api/dashboard/integrations").then(r => r.ok ? r.json() : { items: [] }),
      ]);
      setSettings(s);
      setIntegrations(i.items || []);
    }
    load();
  }, []);

  async function save(partial: any) {
    setSaving(true);
    const res = await fetch("/api/dashboard/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(partial),
    });
    if (res.ok) {
      const updated = await res.json();
      setSettings(updated);
    }
    setSaving(false);
  }

  async function syncMicrosoft() {
    // In real life this would refresh Graph token / call a sync endpoint.
    // For now just update last synced client-side.
    await fetch("/api/dashboard/integrations/sync", { method: "POST" });
    alert("Microsoft services synced (Entra SSO provides Mail, Calendar, Planner, etc.)");
    window.location.reload();
  }

  if (!session) return <div className="p-6">Please log in.</div>;

  const bg = settings?.background || "";

  return (
    <div className="max-w-4xl space-y-6">
      <h1 className="text-2xl font-semibold">User Settings</h1>

      <Card>
        <CardHeader><CardTitle>Appearance</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Background (per-user)</Label>
            <div className="flex gap-2 mt-1">
              <Input
                placeholder="color:#f8fafc  or  image:https://...  or  gradient:linear-gradient(...)"
                value={bg}
                onChange={(e) => setSettings({ ...settings, background: e.target.value })}
              />
              <Button onClick={() => save({ background: bg })} disabled={saving}>Save</Button>
            </div>
            <p className="text-xs text-gray-500 mt-1">Applies to your My Workspace dashboard.</p>
          </div>

          <div className="flex items-center gap-3">
            <Label>Theme</Label>
            <select
              className="border rounded px-2 py-1 text-sm"
              value={settings?.theme || "light"}
              onChange={(e) => save({ theme: e.target.value })}
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="system">System</option>
            </select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>AI &amp; Search Preferences</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Default AI Mode</Label>
            <div className="flex gap-2 mt-1">
              <Button
                variant={settings?.aiMode === "secure" ? "default" : "outline"}
                onClick={() => save({ aiMode: "secure" })}
              >
                Secure AI (recommended)
              </Button>
              <Button
                variant={settings?.aiMode === "external" ? "default" : "outline"}
                onClick={() => save({ aiMode: "external" })}
              >
                External AI
              </Button>
            </div>
          </div>

          <div>
            <Label>Search Preference</Label>
            <div className="flex gap-2 mt-1">
              <Button
                variant={settings?.searchPreference === "internal" ? "default" : "outline"}
                onClick={() => save({ searchPreference: "internal" })}
              >
                Search in CRM / Internal
              </Button>
              <Button
                variant={settings?.searchPreference === "google" ? "default" : "outline"}
                onClick={() => save({ searchPreference: "google" })}
              >
                Google
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Integrations</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600">
            Because you logged in with Microsoft Entra (Azure AD), many Microsoft services are automatically available via your access token (Mail, Calendar, Planner, OneDrive, Teams, Directory). No extra login required.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {["microsoft", "google", "slack"].map((prov) => {
              const connected = integrations.some((i: any) => i.provider === prov);
              return (
                <div key={prov} className="border rounded p-3 flex justify-between items-center">
                  <div>
                    <div className="font-medium capitalize">{prov}</div>
                    <div className="text-xs text-gray-500">{connected ? "Connected" : "Not connected"}</div>
                  </div>
                  {prov === "microsoft" ? (
                    <Button size="sm" onClick={syncMicrosoft}>Sync Microsoft Services</Button>
                  ) : (
                    <Button size="sm" variant="outline" disabled>Connect (coming soon)</Button>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="text-xs text-gray-500">
        Admins can manage available widgets, AI providers and global feature flags in Admin Settings.
      </div>
    </div>
  );
}
