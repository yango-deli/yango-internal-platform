"use client";

import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useTranslation } from "@/lib/i18n";
import { formatLocaleDate, getTimeOfDayGreeting } from "@/lib/i18n";
import type { SupportedLanguage, WidgetKey, DashboardLayout } from "@/types/dashboard";
import { WIDGET_DEFINITIONS, getDefaultLayoutForRole } from "@/types/dashboard";
import { Role } from "@prisma/client";

import { Responsive as ResponsiveGridLayout } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

import { OutlookMailWidget } from "@/components/dashboard/widgets/OutlookMailWidget";
import { TodoWidget } from "@/components/dashboard/widgets/TodoWidget";
import { CalendarWidget } from "@/components/dashboard/widgets/CalendarWidget";
import { AnnouncementsWidget } from "@/components/dashboard/widgets/AnnouncementsWidget";
import { ShortcutsWidget } from "@/components/dashboard/widgets/ShortcutsWidget";
import { QuickStatsWidget } from "@/components/dashboard/widgets/QuickStatsWidget";
import { RecentActivityWidget } from "@/components/dashboard/widgets/RecentActivityWidget";

import { EditModeToolbar } from "@/components/dashboard/EditModeToolbar";
import { AddWidgetPanel } from "@/components/dashboard/AddWidgetPanel";
import { Button } from "@/components/ui/button";
import { Pencil, Plus } from "lucide-react";

const WIDGET_MAP: Record<WidgetKey, React.ComponentType<any>> = {
  outlook_mail: OutlookMailWidget,
  ms_todo: TodoWidget,
  outlook_calendar: CalendarWidget,
  announcements: AnnouncementsWidget,
  shortcuts: ShortcutsWidget,
  quick_stats: QuickStatsWidget,
  recent_activity: RecentActivityWidget,
};

export default function DashboardPage() {
  const { data: session } = useSession();
  const { t } = useTranslation("dashboard");
  const userRole = (session?.user?.role || "viewer") as Role;
  const userName = session?.user?.name?.split(" ")[0] || session?.user?.email?.split("@")[0] || "there";

  const [lang, setLang] = useState<SupportedLanguage>("he");
  const [editMode, setEditMode] = useState(false);
  const [layout, setLayout] = useState<DashboardLayout>({ lg: [] });
  const [visibleWidgets, setVisibleWidgets] = useState<WidgetKey[]>([]);
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

  const currentLayoutItems = useMemo(() => {
    const lg = layout.lg || [];
    return lg.filter((item) => visibleWidgets.includes(item.i as WidgetKey));
  }, [layout, visibleWidgets]);

  // Convert our layout to RGL format
  const rglLayout = useMemo(() => {
    return currentLayoutItems.map((item) => ({
      i: item.i,
      x: item.x,
      y: item.y,
      w: item.w,
      h: item.h,
      minW: item.minW || 3,
      minH: item.minH || 2,
    }));
  }, [currentLayoutItems]);

  function handleLayoutChange(_layout: any, allLayouts: any) {
    if (!editMode) return;
    const lg = allLayouts?.lg || _layout || [];
    const updated: DashboardLayout = {
      lg: lg.map((l: any) => ({
        i: l.i as WidgetKey,
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
    setShowAddPanel(false);
    setSavingLayout(true);
    try {
      await fetch("/api/dashboard/layout", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ layout }),
      });
      // Also persist visible widgets as configs (debounced style)
      for (let i = 0; i < visibleWidgets.length; i++) {
        await fetch(`/api/dashboard/widgets/${visibleWidgets[i]}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ position: i, isVisible: true }),
        });
      }
    } catch {}
    setSavingLayout(false);
  }

  function toggleEdit() {
    if (editMode) {
      exitEditModeAndSave();
    } else {
      setEditMode(true);
    }
  }

  function removeWidget(key: WidgetKey) {
    setVisibleWidgets((prev) => prev.filter((k) => k !== key));
  }

  function addWidget(key: WidgetKey) {
    if (!visibleWidgets.includes(key)) {
      setVisibleWidgets((prev) => [...prev, key]);
    }
    setShowAddPanel(false);
  }

  const currentKeys = visibleWidgets;

  return (
    <div className="space-y-4">
      {/* Header */}
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

          <div className="flex items-center gap-2">
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
            {editMode && (
              <Button variant="outline" onClick={() => setShowAddPanel(true)} className="border-white/30 text-white hover:bg-white/10">
                <Plus className="h-4 w-4 mr-2 rtl:mr-0 rtl:ml-2" /> {t("buttons.addWidget")}
              </Button>
            )}
          </div>
        </div>
      </div>

      {editMode && <EditModeToolbar onExit={exitEditModeAndSave} />}

      {/* Adaptive Grid */}
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
          {visibleWidgets.map((key) => {
            const Widget = WIDGET_MAP[key];
            if (!Widget) return null;
            return (
              <div key={key} className="h-full">
                <Widget editMode={editMode} onRemove={() => removeWidget(key)} />
              </div>
            );
          })}
        </ResponsiveGridLayout>
      </div>

      {/* Add panel (slides from right / left in RTL) */}
      <AddWidgetPanel
        open={showAddPanel}
        onClose={() => setShowAddPanel(false)}
        currentKeys={currentKeys}
        userRole={userRole}
        onAdd={addWidget}
      />

      {savingLayout && (
        <div className="fixed bottom-4 right-4 rtl:left-4 rtl:right-auto bg-black text-white text-xs px-3 py-1 rounded-full opacity-80">
          {t("toasts.layoutSaved")}
        </div>
      )}
    </div>
  );
}
