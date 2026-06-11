/**
 * Widget Registry - Central place for defining all UI elements (widgets) in the adaptive workspace.
 * 
 * HOW TO ADD A NEW WIDGET / FEATURE:
 * 
 * 1. Add your widget key to the WidgetKey type in src/types/dashboard.ts (or use 'custom:*' for dynamic).
 * 2. Create your React component in src/components/dashboard/widgets/YourWidget.tsx
 *    - It receives props: { editMode?: boolean; onRemove?: () => void; config?: any; onConfigChange?: (c: any) => void }
 * 3. Import it here and add to WIDGET_COMPONENTS map.
 * 4. Add a WidgetDefinition entry below (with i18n keys, sizes, roles, resizable rules, category).
 * 5. Update translations in public/locales/{he,en,ru}/dashboard.json (and common if needed).
 * 6. (Optional) If it requires an integration (e.g. "planner"), set requiresIntegration.
 * 7. For admin control: the key can be toggled in Admin Settings (stored in SystemConfig "enabledWidgets").
 * 8. Document any special config schema in the definition.
 * 
 * Custom / Iframe elements are handled specially via "custom:*" keys + config.kind === 'iframe'.
 * 
 * This makes adding integrations, plugins, or new cards very mechanical and low-risk.
 */

import type { ComponentType } from "react";
import type { Role } from "@prisma/client";
import type { WidgetSize } from "@/types/dashboard";

// Import all widget components (add yours here)
import { OutlookMailWidget } from "@/components/dashboard/widgets/OutlookMailWidget";
import { CalendarWidget } from "@/components/dashboard/widgets/CalendarWidget";
import { AnnouncementsWidget } from "@/components/dashboard/widgets/AnnouncementsWidget";
import { ShortcutsWidget } from "@/components/dashboard/widgets/ShortcutsWidget";
import { QuickStatsWidget } from "@/components/dashboard/widgets/QuickStatsWidget";
import { RecentActivityWidget } from "@/components/dashboard/widgets/RecentActivityWidget";
import { PlannerWidget } from "@/components/dashboard/widgets/PlannerWidget"; // replaces old Todo
import { IframeWidget } from "@/components/dashboard/widgets/IframeWidget"; // NEW - for custom iframes

export type WidgetKey = string; // Now more open for custom:iframe:xxx etc.

export interface WidgetDefinition {
  key: WidgetKey;
  titleKey: string;
  descriptionKey: string;
  defaultSize: WidgetSize;
  minW?: number;
  minH?: number;
  maxW?: number;
  maxH?: number;
  resizable?: boolean;           // default true
  roles: Role[];
  category: "core" | "microsoft" | "productivity" | "communication" | "custom" | "analytics";
  requiresIntegration?: string;  // e.g. "microsoft" or "planner"
  isCustom?: boolean;            // for iframe / user-created elements
}

export const WIDGET_DEFINITIONS: WidgetDefinition[] = [
  {
    key: "outlook_mail",
    titleKey: "widgets.outlook_mail.title",
    descriptionKey: "widgets.outlook_mail.description",
    defaultSize: "medium",
    minW: 4,
    minH: 3,
    resizable: true,
    roles: ["admin", "manager", "analyst", "viewer"],
    category: "microsoft",
    requiresIntegration: "microsoft",
  },
  {
    key: "ms_planner",
    titleKey: "widgets.ms_planner.title",
    descriptionKey: "widgets.ms_planner.description",
    defaultSize: "medium",
    minW: 4,
    minH: 3,
    resizable: true,
    roles: ["admin", "manager", "analyst", "viewer"],
    category: "microsoft",
    requiresIntegration: "microsoft",
  },
  {
    key: "outlook_calendar",
    titleKey: "widgets.outlook_calendar.title",
    descriptionKey: "widgets.outlook_calendar.description",
    defaultSize: "large",
    minW: 5,
    minH: 3,
    maxW: 12,
    maxH: 6,
    resizable: true,
    roles: ["admin", "manager", "analyst", "viewer"],
    category: "microsoft",
    requiresIntegration: "microsoft",
  },
  {
    key: "announcements",
    titleKey: "widgets.announcements.title",
    descriptionKey: "widgets.announcements.description",
    defaultSize: "medium",
    minW: 4,
    minH: 3,
    resizable: true,
    roles: ["admin", "manager", "analyst", "viewer"],
    category: "core",
  },
  {
    key: "shortcuts",
    titleKey: "widgets.shortcuts.title",
    descriptionKey: "widgets.shortcuts.description",
    defaultSize: "medium",
    minW: 4,
    minH: 2,
    resizable: true,
    roles: ["admin", "manager", "analyst", "viewer"],
    category: "productivity",
  },
  {
    key: "quick_stats",
    titleKey: "widgets.quick_stats.title",
    descriptionKey: "widgets.quick_stats.description",
    defaultSize: "small",
    minW: 3,
    minH: 2,
    maxW: 4,
    maxH: 3,
    resizable: true,
    roles: ["admin", "manager", "analyst", "viewer"],
    category: "analytics",
  },
  {
    key: "recent_activity",
    titleKey: "widgets.recent_activity.title",
    descriptionKey: "widgets.recent_activity.description",
    defaultSize: "medium",
    minW: 4,
    minH: 3,
    resizable: true,
    roles: ["admin", "manager", "analyst", "viewer"],
    category: "analytics",
  },
  // Special custom / embed element
  {
    key: "custom_iframe",
    titleKey: "widgets.custom_iframe.title",
    descriptionKey: "widgets.custom_iframe.description",
    defaultSize: "medium",
    minW: 4,
    minH: 3,
    resizable: true,
    roles: ["admin", "manager", "analyst", "viewer"],
    category: "custom",
    isCustom: true,
  },
];

export const WIDGET_COMPONENTS: Record<string, ComponentType<any>> = {
  outlook_mail: OutlookMailWidget,
  ms_planner: PlannerWidget,
  outlook_calendar: CalendarWidget,
  announcements: AnnouncementsWidget,
  shortcuts: ShortcutsWidget,
  quick_stats: QuickStatsWidget,
  recent_activity: RecentActivityWidget,
  custom_iframe: IframeWidget,
  // Fallback for old "ms_todo" keys during migration
  ms_todo: PlannerWidget,
};

export function getWidgetDefinition(key: string): WidgetDefinition | undefined {
  return WIDGET_DEFINITIONS.find((d) => d.key === key || key.startsWith(d.key));
}

export function isWidgetEnabled(key: string, enabledList?: string[]): boolean {
  if (!enabledList || enabledList.length === 0) return true;
  const def = getWidgetDefinition(key);
  if (!def) return true; // allow customs by default
  return enabledList.includes(def.key) || enabledList.includes(key);
}

/**
 * Get system links that can be turned into auto shortcuts based on role.
 * Used by ShortcutsWidget for "Suggested shortcuts".
 */
export function getSystemShortcutSuggestions(role: Role): Array<{ title: string; url: string; icon: string }> {
  const base = [
    { title: "My Workspace", url: "/dashboard", icon: "🏠" },
  ];

  if (["admin", "manager", "analyst"].includes(role)) {
    base.push({ title: "Simulation Tool", url: "/simulation", icon: "🧪" });
  }
  if (role === "admin") {
    base.push({ title: "User Management", url: "/users", icon: "👥" });
    base.push({ title: "Admin Settings", url: "/admin", icon: "⚙️" });
  }
  return base;
}
