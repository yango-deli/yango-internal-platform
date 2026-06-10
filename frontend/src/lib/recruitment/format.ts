import { format } from "date-fns";

export function formatDate(date: string | Date): string {
  return format(new Date(date), "dd/MM/yyyy");
}

export function formatRelativeTime(
  date: string | Date,
  t: (key: string, params?: Record<string, string | number>) => string
): string {
  const diff = Date.now() - new Date(date).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return t("time.justNow");
  if (minutes < 60) return t("time.minutes", { count: minutes });
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return t("time.hours", { count: hours });
  const days = Math.floor(hours / 24);
  return t("time.days", { count: days });
}

export function translateActivity(
  description: string,
  t: (key: string, params?: Record<string, string | number>) => string,
  metadata?: Record<string, unknown> | null
): string {
  if (description.startsWith("activity.")) {
    const params: Record<string, string> = {};
    if (metadata?.from) params.from = t(`stages.${metadata.from}`);
    if (metadata?.to) params.to = t(`stages.${metadata.to}`);
    if (metadata?.name) params.name = String(metadata.name);
    return t(description, params);
  }
  return description;
}
