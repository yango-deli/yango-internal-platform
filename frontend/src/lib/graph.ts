/**
 * Microsoft Graph API thin client for dashboard widgets.
 * Requires a valid access token with appropriate scopes from Azure AD / Microsoft Entra.
 */

const GRAPH_BASE = "https://graph.microsoft.com/v1.0";

interface GraphError {
  error: {
    code: string;
    message: string;
  };
}

async function graphFetch<T>(
  accessToken: string,
  path: string,
  init?: RequestInit
): Promise<{ data?: T; error?: string; status?: number }> {
  try {
    const res = await fetch(`${GRAPH_BASE}${path}`, {
      ...init,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        ...init?.headers,
      },
    });

    if (!res.ok) {
      if (res.status === 401 || res.status === 403) {
        return { error: "insufficient_scope_or_token", status: res.status };
      }
      const body = (await res.json().catch(() => ({}))) as GraphError;
      return {
        error: body?.error?.message || `Graph API error (${res.status})`,
        status: res.status,
      };
    }

    const data = (await res.json()) as T;
    return { data };
  } catch (e: unknown) {
    return { error: e instanceof Error ? e.message : "Network error calling Graph" };
  }
}

export interface OutlookMessage {
  id: string;
  subject: string;
  bodyPreview: string;
  receivedDateTime: string;
  from: {
    emailAddress: {
      name?: string;
      address?: string;
    };
  };
  isRead?: boolean;
  webLink?: string;
}

export async function getMyEmails(accessToken: string, top = 5) {
  const path = `/me/messages?$top=${top}&$orderby=receivedDateTime desc&$select=id,subject,bodyPreview,receivedDateTime,from,isRead,webLink`;
  const res = await graphFetch<{ value: OutlookMessage[] }>(accessToken, path);
  return res;
}

export interface TodoTask {
  id: string;
  title: string;
  status: "notStarted" | "inProgress" | "completed" | string;
  dueDateTime?: {
    dateTime?: string;
    timeZone?: string;
  } | null;
  createdDateTime?: string;
  webLink?: string;
}

export async function getMyTodoTasks(accessToken: string, top = 8) {
  // Get default task list (or first available) then its tasks
  const listsRes = await graphFetch<{ value: Array<{ id: string; displayName: string }> }>(
    accessToken,
    "/me/todo/lists?$select=id,displayName"
  );
  if (listsRes.error || !listsRes.data?.value?.length) {
    return { error: listsRes.error || "no_todo_lists", status: listsRes.status };
  }

  // Prefer "Tasks" or first list
  const list =
    listsRes.data.value.find((l) => /task/i.test(l.displayName)) || listsRes.data.value[0];

  const tasksPath = `/me/todo/lists/${list.id}/tasks?$filter=status ne 'completed'&$top=${top}&$orderby=dueDateTime/dateTime asc&$select=id,title,status,dueDateTime,createdDateTime,webLink`;
  const tasksRes = await graphFetch<{ value: TodoTask[] }>(accessToken, tasksPath);

  if (tasksRes.data) {
    // Attach list name for display
    const enriched = tasksRes.data.value.map((t) => ({ ...t, listName: list.displayName }));
    return { data: enriched, listName: list.displayName };
  }
  return tasksRes;
}

export async function completeTodoTask(accessToken: string, listId: string, taskId: string) {
  const path = `/me/todo/lists/${listId}/tasks/${taskId}`;
  const res = await graphFetch(accessToken, path, {
    method: "PATCH",
    body: JSON.stringify({ status: "completed" }),
  });
  return res;
}

export interface CalendarEvent {
  id: string;
  subject: string;
  start: { dateTime: string; timeZone: string };
  end: { dateTime: string; timeZone: string };
  location?: { displayName?: string };
  webLink?: string;
  isAllDay?: boolean;
}

export async function getMyCalendarEvents(accessToken: string, days = 7) {
  const now = new Date();
  const end = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

  const startStr = now.toISOString();
  const endStr = end.toISOString();

  // calendarview automatically expands recurring
  const path = `/me/calendarview?startDateTime=${encodeURIComponent(
    startStr
  )}&endDateTime=${encodeURIComponent(endStr)}&$orderby=start/dateTime&$select=id,subject,start,end,location,webLink,isAllDay&$top=50`;
  const res = await graphFetch<{ value: CalendarEvent[] }>(accessToken, path);
  return res;
}

export interface GraphMe {
  id: string;
  displayName?: string;
  mail?: string;
}

export async function getMe(accessToken: string) {
  return graphFetch<GraphMe>(accessToken, "/me?$select=id,displayName,mail");
}
