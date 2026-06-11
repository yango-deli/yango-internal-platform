"use client";

import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useTranslation } from "@/lib/i18n";
import { formatLocaleDate, getTimeOfDayGreeting } from "@/lib/i18n";
import type { SupportedLanguage, DashboardLayout, WidgetKey } from "@/types/dashboard";
import { getDefaultLayoutForRole } from "@/types/dashboard";
import { Role } from "@prisma/client";

import { Responsive as ResponsiveGridLayout } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

import {
  WIDGET_DEFINITIONS,
  WIDGET_COMPONENTS,
  getWidgetDefinition,
  getSystemShortcutSuggestions,
  isWidgetEnabled,
  type WidgetDefinition,
} from "@/lib/widgets/registry";

import { EditModeToolbar } from "@/components/dashboard/EditModeToolbar";
import { Button } from "@/components/ui/button";
import { Pencil, Plus, Search, Bot } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Helper to generate unique custom keys
function generateCustomKey(kind: string) {
  return `custom:${kind}:${Date.now()}`;
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const { t } = useTranslation("dashboard");
  const userRole = (session?.user?.role || "viewer") as Role;
  const userName = session?.user?.name?.split(" ")[0] || session?.user?.email?.split("@")[0] || "there";

  const [lang, setLang] = useState<SupportedLanguage>("he");
  const [editMode, setEditMode] = useState(false);
  const [layout, setLayout] = useState<DashboardLayout>({ lg: [] });
  const [visibleWidgets, setVisibleWidgets] = useState<string[]>([]);
  const [showAddPanel, setShowAddPanel] = useState(false);
  const [savingLayout, setSavingLayout] = useState(false);

  // Detect current lang from html (synced by LanguageSwitcher / root)
  useEffect(() => {
    const htmlLang = (document.documentElement.lang || "he") as SupportedLanguage;
    setLang(["he", "en", "ru"].includes(htmlLang) ? htmlLang : "he");
  }, []);

  const greeting = getTimeOfDayGreeting(lang);
  const todayStr = formatLocaleDate(new Date(), lang);

  // Load layout + visible widgets from API
  const loadLayout = useCallback(async () => {
    try {
      const [layoutRes, widgetsRes] = await Promise.all([
        fetch("/api/dashboard/layout"),
        fetch("/api/dashboard/widgets"),
      ]);
      const layoutJson = await layoutRes.json();
      const widgetsJson = await widgetsRes.json();

      const serverLayout = layoutJson.layout as DashboardLayout;
      if (serverLayout && Object.keys(serverLayout).length > 0) {
        setLayout(serverLayout);
      } else {
        setLayout(getDefaultLayoutForRole(userRole));
      }

      const configs: any[] = widgetsJson.configs || [];
      const visible = configs
        .filter((c) => c.isVisible !== false)
        .sort((a, b) => a.position - b.position)
        .map((c) => c.widgetKey as WidgetKey);

      if (visible.length > 0) {
        setVisibleWidgets(visible);
      } else {
        // Default visible set for role
        const defaults = WIDGET_DEFINITIONS.filter((w) => w.roles.includes(userRole as any)).map((w) => w.key);
        setVisibleWidgets(defaults);
      }
    } catch {
      // Fallback to role default
      setLayout(getDefaultLayoutForRole(userRole));
      setVisibleWidgets(WIDGET_DEFINITIONS.filter((w) => w.roles.includes(userRole as any)).map((w) => w.key));
    }
  }, [userRole]);

  useEffect(() => {
    loadLayout();
  }, [loadLayout]);

  // User settings (background, ai/search prefs)
  const [userSettings, setUserSettings] = useState<any>(null);
  const [searchMode, setSearchMode] = useState<"internal" | "google">("internal");
  const [aiMode, setAiMode] = useState<"secure" | "external">("secure");
  const [aiQuery, setAiQuery] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState<string | null>(null);

  // Custom elements (iframes etc) stored by their grid key
  const [customElements, setCustomElements] = useState<Record<string, any>>({});

  // Creation dialog state
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [createKind, setCreateKind] = useState<"widget" | "iframe">("widget");
  const [iframeForm, setIframeForm] = useState({ title: "", url: "" });

  // Load user settings + layout
  const loadEverything = useCallback(async () => {
    try {
      const [layoutRes, widgetsRes, settingsRes] = await Promise.all([
        fetch("/api/dashboard/layout"),
        fetch("/api/dashboard/widgets"),
        fetch("/api/dashboard/settings"),
      ]);

      const layoutJson = await layoutRes.json();
      const widgetsJson = await widgetsRes.json();
      const settingsJson = settingsRes.ok ? await settingsRes.json() : null;

      setUserSettings(settingsJson);
      if (settingsJson?.aiMode) setAiMode(settingsJson.aiMode);
      if (settingsJson?.searchPreference) setSearchMode(settingsJson.searchPreference);

      const serverLayout = layoutJson.layout as DashboardLayout;
      const baseLayout = serverLayout && Object.keys(serverLayout).length > 0
        ? serverLayout
        : getDefaultLayoutForRole(userRole); // fallback from registry (old fn still works)

      setLayout(baseLayout);

      const configs: any[] = widgetsJson.configs || [];
      const visible: string[] = [];
      const customs: Record<string, any> = {};

      configs.forEach((c) => {
        if (c.isVisible === false) return;
        if (c.widgetKey?.startsWith("custom:")) {
          customs[c.widgetKey] = c.config || {};
          visible.push(c.widgetKey);
        } else {
          visible.push(c.widgetKey);
        }
      });

      if (visible.length > 0) {
        setVisibleWidgets(visible);
      } else {
        const defaults = WIDGET_DEFINITIONS.filter((w) => w.roles.includes(userRole as any)).map((w) => w.key);
        setVisibleWidgets(defaults);
      }
      setCustomElements(customs);
    } catch {
      const defaults = WIDGET_DEFINITIONS.filter((w) => w.roles.includes(userRole as any)).map((w) => w.key);
      setVisibleWidgets(defaults);
      setLayout({ lg: [] });
    }
  }, [userRole]);

  useEffect(() => { loadEverything(); }, [loadEverything]);

  // Background style from user settings
  const backgroundStyle = useMemo(() => {
    const bg = userSettings?.background;
    if (!bg) return {};
    if (bg.startsWith("color:")) return { backgroundColor: bg.replace("color:", "") };
    if (bg.startsWith("image:")) return { backgroundImage: `url(${bg.replace("image:", "")})`, backgroundSize: "cover", backgroundPosition: "center" };
    if (bg.startsWith("gradient:")) return { background: bg.replace("gradient:", "") };
    return {};
  }, [userSettings]);



  function handleLayoutChange(_layout: any, allLayouts: any) {
    if (!editMode) return;
    const lg = allLayouts?.lg || _layout || [];
    const updated: DashboardLayout = {
      lg: lg.map((l: any) => ({
        i: l.i,
        x: l.x,
        y: l.y,
        w: l.w,
        h: l.h,
      })),
    };
    setLayout(updated);
  }

  async function exitEditModeAndSave() {
    setEditMode(false);
    setShowCreateDialog(false);
    setSavingLayout(true);
    try {
      await fetch("/api/dashboard/layout", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ layout }),
      });

      for (let i = 0; i < visibleWidgets.length; i++) {
        const key = visibleWidgets[i];
        const isCustom = key.startsWith("custom:");
        await fetch(`/api/dashboard/widgets/${encodeURIComponent(key)}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            position: i,
            isVisible: true,
            config: isCustom ? customElements[key] : undefined,
          }),
        });
      }
    } catch {}
    setSavingLayout(false);
  }

  function toggleEdit() {
    if (editMode) exitEditModeAndSave();
    else setEditMode(true);
  }

  function removeWidget(key: string) {
    setVisibleWidgets((prev) => prev.filter((k) => k !== key));
    if (key.startsWith("custom:")) {
      setCustomElements((prev) => {
        const n = { ...prev }; delete n[key]; return n;
      });
    }
  }

  function addSystemWidget(key: string) {
    if (!visibleWidgets.includes(key)) setVisibleWidgets((prev) => [...prev, key]);
  }

  // Prominent + creation flow
  function openCreate() {
    setCreateKind("widget");
    setIframeForm({ title: "", url: "" });
    setShowCreateDialog(true);
  }

  async function createElement() {
    if (createKind === "widget") {
      // For simplicity, open the old style add (or pick first available)
      const available = WIDGET_DEFINITIONS.filter((w) =>
        w.roles.includes(userRole as any) && !visibleWidgets.includes(w.key)
      );
      if (available.length > 0) addSystemWidget(available[0].key);
    } else {
      // Create iframe custom element
      if (!iframeForm.url) return;
      const newKey = generateCustomKey("iframe");
      const newConfig = {
        kind: "iframe",
        title: iframeForm.title || "Embedded Page",
        url: iframeForm.url,
        height: 320,
      };
      setCustomElements((prev) => ({ ...prev, [newKey]: newConfig }));
      setVisibleWidgets((prev) => [...prev, newKey]);
    }
    setShowCreateDialog(false);
    setIframeForm({ title: "", url: "" });
  }

  // Render a single grid item (system or custom)
  function renderWidget(key: string) {
    if (key.startsWith("custom:")) {
      const cfg = customElements[key] || {};
      const Comp = WIDGET_COMPONENTS["custom_iframe"];
      if (!Comp) return null;
      return <Comp key={key} editMode={editMode} onRemove={() => removeWidget(key)} config={cfg} />;
    }

    const Comp = WIDGET_COMPONENTS[key];
    if (!Comp) return null;
    return <Comp key={key} editMode={editMode} onRemove={() => removeWidget(key)} />;
  }

  // Simple AI bar handler (calls backend; falls back to friendly message)
  async function sendAi() {
    if (!aiQuery.trim()) return;
    setAiLoading(true);
    setAiResponse(null);
    try {
      const res = await fetch("/api/ai/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: aiQuery, mode: aiMode }),
      });
      const data = await res.json().catch(() => ({}));
      setAiResponse(data.reply || "AI is not configured yet. Set providers in Admin Settings.");
    } catch {
      setAiResponse("Secure AI response would appear here (demo mode). Configure in Admin Settings.");
    }
    setAiLoading(false);
    setAiQuery("");
  }

  // Search
  function performSearch(q: string) {
    if (!q.trim()) return;
    if (searchMode === "google") {
      window.open(`https://www.google.com/search?q=${encodeURIComponent(q)}`, "_blank");
    } else {
      // Internal "CRM" style search - for now just filter visible or alert a result
      alert(`Internal search results for: ${q}\n(Integrate with your CRM / announcements / users here)`);
    }
  }

  const currentKeys = visibleWidgets;

  const currentLayoutItems = useMemo(() => {
    const lg = layout.lg || [];
    return lg.filter((item: any) => visibleWidgets.includes(item.i));
  }, [layout, visibleWidgets]);

  const rglLayout = useMemo(() => {
    return currentLayoutItems.map((item: any) => {
      const def = getWidgetDefinition(item.i) || ({} as any);
      return {
        i: item.i,
        x: item.x,
        y: item.y,
        w: item.w,
        h: item.h,
        minW: item.minW ?? def.minW ?? 3,
        minH: item.minH ?? def.minH ?? 2,
      };
    });
  }, [currentLayoutItems]);

  return (
    <div className="space-y-4" style={backgroundStyle}>
      {/* Header with Search + Create */}
      <div className="rounded-2xl bg-gradient-to-br from-gray-900 via-gray-900 to-black p-6 text-white">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="text-2xl font-semibold tracking-tight">
              {t("header.greeting", { greeting, name: userName })}
            </div>
            <div className="mt-1 text-sm text-gray-300">{todayStr}</div>
            <div className="mt-2 inline-flex items-center rounded-full bg-white/10 px-3 py-0.5 text-xs font-medium">
              {t("header.roleBadge", { role: t(`common:roles.${userRole.toLowerCase()}` as any) || userRole })}
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Search bar with switch */}
            <div className="flex items-center bg-white/10 rounded-lg overflow-hidden">
              <div className="flex text-xs">
                <button
                  onClick={() => setSearchMode("internal")}
                  className={`px-2 py-1 ${searchMode === "internal" ? "bg-white/20" : ""}`}
                >
                  {t("search.internal")}
                </button>
                <button
                  onClick={() => setSearchMode("google")}
                  className={`px-2 py-1 ${searchMode === "google" ? "bg-white/20" : ""}`}
                >
                  {t("search.google")}
                </button>
              </div>
              <input
                type="text"
                placeholder={t("search.placeholder")}
                className="bg-transparent text-sm px-3 py-1 w-48 outline-none placeholder:text-white/60"
                onKeyDown={(e) => {
                  if (e.key === "Enter") performSearch((e.target as HTMLInputElement).value);
                }}
              />
              <Search className="mr-2 h-4 w-4 opacity-70" />
            </div>

            <Button onClick={openCreate} className="bg-[#FFCC00] text-gray-900 hover:bg-yellow-400">
              <Plus className="h-4 w-4 mr-2 rtl:mr-0 rtl:ml-2" /> +
            </Button>

            <Button
              onClick={toggleEdit}
              variant={editMode ? "default" : "outline"}
              className={editMode ? "bg-white text-gray-900 hover:bg-white/90" : "border-white/30 text-white hover:bg-white/10"}
            >
              {editMode ? (
                <>{t("page.exitEditMode")}</>
              ) : (
                <>
                  <Pencil className="h-4 w-4 mr-2 rtl:mr-0 rtl:ml-2" />
                  {t("page.editMode")}
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {editMode && <EditModeToolbar onExit={exitEditModeAndSave} />}

      {/* Adaptive Grid with improved resize from definitions */}
      <div className={editMode ? "ring-1 ring-amber-300 rounded-xl p-1" : ""}>
        <ResponsiveGridLayout
          className="layout"
          layouts={{ lg: rglLayout }}
          breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
          cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
          rowHeight={70}
          onLayoutChange={handleLayoutChange}
          margin={[12, 12]}
          containerPadding={[0, 0]}
          width={1200}
        >
          {visibleWidgets.map((key) => (
            <div key={key} className="h-full">
              {renderWidget(key)}
            </div>
          ))}
        </ResponsiveGridLayout>
      </div>

      {/* Ask AI Bar */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 rtl:translate-x-1/2 z-50 w-[min(620px,92vw)] rounded-2xl border bg-white shadow-xl p-2 flex items-center gap-2">
        <div className="flex items-center gap-1 text-xs px-2">
          <Bot className="h-4 w-4" />
          <span className="font-medium hidden sm:inline">Ask AI</span>
        </div>

        <div className="flex rounded bg-gray-100 p-0.5 text-xs">
          <button
            onClick={() => setAiMode("secure")}
            className={`px-3 py-0.5 rounded ${aiMode === "secure" ? "bg-[#FFCC00] text-gray-900" : ""}`}
          >
            {t("ai_bar.secure")}
          </button>
          <button
            onClick={() => setAiMode("external")}
            className={`px-3 py-0.5 rounded ${aiMode === "external" ? "bg-[#FFCC00] text-gray-900" : ""}`}
          >
            {t("ai_bar.external")}
          </button>
        </div>

        <input
          value={aiQuery}
          onChange={(e) => setAiQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendAi()}
          placeholder={t("ai_bar.placeholder")}
          className="flex-1 text-sm outline-none px-2"
        />
        <Button size="sm" onClick={sendAi} disabled={aiLoading}>
          {t("ai_bar.send")}
        </Button>

        {aiResponse && (
          <div className="absolute -top-16 left-0 right-0 bg-white border rounded p-2 text-xs shadow text-gray-700">
            {aiResponse}
          </div>
        )}
      </div>

      {/* Create Element Dialog (the new + experience) */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create UI Element</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex gap-2">
              <Button variant={createKind === "widget" ? "default" : "outline"} onClick={() => setCreateKind("widget")}>
                System Widget
              </Button>
              <Button variant={createKind === "iframe" ? "default" : "outline"} onClick={() => setCreateKind("iframe")}>
                Iframe / Embed
              </Button>
            </div>

            {createKind === "widget" && (
              <div className="text-sm text-gray-600">
                Choose from available system widgets (Planner, Mail, Calendar, Announcements, Shortcuts, etc).
                More can be enabled by admins in Admin Settings.
              </div>
            )}

            {createKind === "iframe" && (
              <div className="space-y-3">
                <div>
                  <Label>Title</Label>
                  <Input value={iframeForm.title} onChange={(e) => setIframeForm({ ...iframeForm, title: e.target.value })} placeholder="e.g. Internal CRM Dashboard" />
                </div>
                <div>
                  <Label>URL (https://...)</Label>
                  <Input value={iframeForm.url} onChange={(e) => setIframeForm({ ...iframeForm, url: e.target.value })} placeholder="https://example.com/embed" />
                </div>
                <div className="text-xs text-gray-500">The embed will be resizable in Edit mode. Use trusted internal URLs when possible.</div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>Cancel</Button>
            <Button onClick={createElement}>
              {createKind === "iframe" ? "Add Iframe" : "Add Widget"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {savingLayout && (
        <div className="fixed bottom-4 right-4 rtl:left-4 rtl:right-auto bg-black text-white text-xs px-3 py-1 rounded-full opacity-80">
          {t("toasts.layoutSaved")}
        </div>
      )}
    </div>
  );
}
