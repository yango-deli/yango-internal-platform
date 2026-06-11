import { Role } from "@prisma/client";

export type SupportedLanguage = "he" | "en" | "ru";

export type WidgetKey =
  | "outlook_mail"
  | "ms_todo"
  | "ms_planner"
  | "outlook_calendar"
  | "onedrive"
  | "announcements"
  | "shortcuts"
  | "quick_stats"
  | "recent_activity";

export type WidgetSize = "small" | "medium" | "large" | "full";

export interface DashboardLayoutItem {
  i: WidgetKey;
  x: number;
  y: number;
  w: number;
  h: number;
  minW?: number;
  minH?: number;
  maxW?: number;
  maxH?: number;
}

export interface DashboardLayout {
  lg?: DashboardLayoutItem[];
  md?: DashboardLayoutItem[];
  sm?: DashboardLayoutItem[];
  xs?: DashboardLayoutItem[];
  xxs?: DashboardLayoutItem[];
}

export interface UserSettings {
  id: string;
  userId: string;
  language: SupportedLanguage;
  theme: "light" | "dark" | "system";
  createdAt: string;
  updatedAt: string;
}

export interface UserShortcut {
  id: string;
  userId: string;
  title: string;
  url: string;
  icon?: string | null;
  color?: string | null;
  openInNewTab: boolean;
  position: number;
  isVisible: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserWidgetConfig {
  id: string;
  userId: string;
  widgetKey: WidgetKey;
  position: number;
  size: WidgetSize;
  config?: Record<string, unknown> | null;
  isVisible: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CompanyAnnouncement {
  id: string;
  title: string;
  body: string;
  authorId: string;
  author?: { name: string | null; email: string };
  isPinned: boolean;
  targetRoles: Role[];
  expiresAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface GraphEmail {
  id: string;
  subject: string;
  bodyPreview?: string;
  receivedDateTime: string;
  from?: {
    emailAddress?: {
      name?: string;
      address?: string;
    };
  };
  isRead?: boolean;
  webLink?: string;
}

export interface GraphTodoTask {
  id: string;
  title: string;
  status: string;
  dueDateTime?: {
    dateTime?: string;
    timeZone?: string;
  } | null;
  listName?: string;
  webLink?: string;
}

export interface GraphCalendarEvent {
  id: string;
  subject: string;
  start: {
    dateTime: string;
    timeZone: string;
  };
  end: {
    dateTime: string;
    timeZone: string;
  };
  location?: {
    displayName?: string;
  };
  webLink?: string;
}

export interface QuickStat {
  key: string;
  label: string;
  value: number | string;
  icon?: string;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
}

export interface RecentActivityItem {
  id: string;
  fileName: string;
  createdAt: string;
  status?: string;
  summary?: Record<string, unknown>;
}

export interface WidgetDefinition {
  key: WidgetKey;
  titleKey: string;
  descriptionKey: string;
  defaultSize: WidgetSize;
  minW?: number;
  minH?: number;
  roles: Role[];
}

export const WIDGET_DEFINITIONS: WidgetDefinition[] = [
  {
    key: "outlook_mail",
    titleKey: "widgets.outlook_mail.title",
    descriptionKey: "widgets.outlook_mail.description",
    defaultSize: "medium",
    minW: 4,
    minH: 3,
    roles: ["admin", "manager", "analyst", "viewer"],
  },
  {
    key: "ms_todo",
    titleKey: "widgets.ms_todo.title",
    descriptionKey: "widgets.ms_todo.description",
    defaultSize: "medium",
    minW: 4,
    minH: 3,
    roles: ["admin", "manager", "analyst", "viewer"],
  },
  {
    key: "ms_planner",
    titleKey: "widgets.ms_planner.title",
    descriptionKey: "widgets.ms_planner.description",
    defaultSize: "medium",
    minW: 4,
    minH: 3,
    roles: ["admin", "manager", "analyst"],
  },
  {
    key: "outlook_calendar",
    titleKey: "widgets.outlook_calendar.title",
    descriptionKey: "widgets.outlook_calendar.description",
    defaultSize: "large",
    minW: 6,
    minH: 3,
    roles: ["admin", "manager", "analyst", "viewer"],
  },
  {
    key: "onedrive",
    titleKey: "widgets.onedrive.title",
    descriptionKey: "widgets.onedrive.description",
    defaultSize: "medium",
    minW: 3,
    minH: 2,
    roles: ["admin", "manager", "analyst", "viewer"],
  },
  {
    key: "announcements",
    titleKey: "widgets.announcements.title",
    descriptionKey: "widgets.announcements.description",
    defaultSize: "medium",
    minW: 4,
    minH: 3,
    roles: ["admin", "manager", "analyst", "viewer"],
  },
  {
    key: "shortcuts",
    titleKey: "widgets.shortcuts.title",
    descriptionKey: "widgets.shortcuts.description",
    defaultSize: "medium",
    minW: 4,
    minH: 2,
    roles: ["admin", "manager", "analyst", "viewer"],
  },
  {
    key: "quick_stats",
    titleKey: "widgets.quick_stats.title",
    descriptionKey: "widgets.quick_stats.description",
    defaultSize: "small",
    minW: 3,
    minH: 2,
    roles: ["admin", "manager", "analyst", "viewer"],
  },
  {
    key: "recent_activity",
    titleKey: "widgets.recent_activity.title",
    descriptionKey: "widgets.recent_activity.description",
    defaultSize: "medium",
    minW: 4,
    minH: 3,
    roles: ["admin", "manager", "analyst", "viewer"],
  },
];

// Default layout seeds per role (12-col grid, react-grid-layout)
export function getDefaultLayoutForRole(role: Role): DashboardLayout {
  const base: DashboardLayoutItem[] = [
    { i: "quick_stats",      x: 0, y: 0, w: 3, h: 2 },
    { i: "shortcuts",        x: 3, y: 0, w: 6, h: 2 },
    { i: "outlook_mail",     x: 9, y: 0, w: 3, h: 4 },
    { i: "ms_planner",       x: 0, y: 2, w: 4, h: 4 },
    { i: "outlook_calendar", x: 4, y: 2, w: 5, h: 4 },
    { i: "onedrive",         x: 9, y: 4, w: 3, h: 3 },
    { i: "announcements",    x: 0, y: 6, w: 6, h: 4 },
    { i: "recent_activity",  x: 6, y: 6, w: 6, h: 4 },
  ];

  if (role === "admin") {
    return {
      lg: [
        { i: "quick_stats",      x: 0, y: 0, w: 4, h: 2 },
        { i: "shortcuts",        x: 4, y: 0, w: 5, h: 2 },
        { i: "outlook_mail",     x: 9, y: 0, w: 3, h: 4 },
        { i: "ms_planner",       x: 0, y: 2, w: 4, h: 4 },
        { i: "outlook_calendar", x: 4, y: 2, w: 5, h: 4 },
        { i: "onedrive",         x: 9, y: 4, w: 3, h: 3 },
        { i: "announcements",    x: 0, y: 6, w: 6, h: 4 },
        { i: "recent_activity",  x: 6, y: 6, w: 6, h: 4 },
      ],
    };
  }

  return { lg: base };
}

export const SUPPORTED_LANGUAGES: { code: SupportedLanguage; label: string; flag: string }[] = [
  { code: "he", label: "\u05E2\u05D1\u05E8\u05D9\u05EA", flag: "\uD83C\uDDEE\uD83C\uDDF1" },
  { code: "en", label: "English",   flag: "\uD83C\uDDEC\uD83C\uDDE7" },
  { code: "ru", label: "\u0420\u0443\u0441\u0441\u043A\u0438\u0439", flag: "\uD83C\uDDF7\uD83C\uDDFA" },
];
