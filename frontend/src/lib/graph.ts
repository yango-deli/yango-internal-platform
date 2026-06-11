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

// ==================== Microsoft Planner (replaces legacy To Do) ====================
export interface PlannerTask {
  id: string;
  title: string;
  percentComplete?: number;
  dueDateTime?: string | null;
  planTitle?: string;
}

export async function getMyPlannerTasks(accessToken: string, top = 10) {
  const path = `/me/planner/tasks?$top=${top}&$expand=plan&$select=id,title,percentComplete,dueDateTime,planId`;
  const res = await graphFetch<{ value: any[] }>(accessToken, path);

  if (res.error || !res.data?.value) {
    return { error: res.error || "no_planner_tasks", status: res.status };
  }

  const tasks: PlannerTask[] = (res.data.value || []).map((t: any) => ({
    id: t.id,
    title: t.title,
    percentComplete: t.percentComplete ?? 0,
    dueDateTime: t.dueDateTime,
    planTitle: t.plan?.title,
  }));

  return { data: tasks };
}

export async function updatePlannerTaskProgress(accessToken: string, taskId: string, percentComplete: number) {
  // Note: production Planner PATCH requires proper ETag (If-Match header).
  const path = `/planner/tasks/${taskId}`;
  return graphFetch(accessToken, path, {
    method: "PATCH",
    body: JSON.stringify({ percentComplete }),
  });
}

// ==================== Auto Microsoft Integrations via Entra SSO ====================
// These leverage the same accessToken from Azure AD login. No extra OAuth needed
// if the app registration has the scopes (see auth.ts). Admin can grant consent.

export interface OneDriveFile {
  id: string;
  name: string;
  webUrl: string;
  lastModifiedDateTime?: string;
  size?: number;
}

export async function getMyRecentOneDriveFiles(accessToken: string, top = 8) {
  // Recent files the user interacted with
  const path = `/me/drive/recent?$top=${top}&$select=id,name,webUrl,lastModifiedDateTime,size`;
  const res = await graphFetch<{ value: any[] }>(accessToken, path);
  if (res.error || !res.data?.value) {
    return { error: res.error || "no_onedrive", status: res.status };
  }
  const files: OneDriveFile[] = res.data.value.map((f: any) => ({
    id: f.id,
    name: f.name,
    webUrl: f.webUrl,
    lastModifiedDateTime: f.lastModifiedDateTime,
    size: f.size,
  }));
  return { data: files };
}

export interface Team {
  id: string;
  displayName: string;
  webUrl?: string;
}

export async function getMyTeams(accessToken: string) {
  const path = `/me/joinedTeams?$select=id,displayName,webUrl`;
  const res = await graphFetch<{ value: any[] }>(accessToken, path);
  if (res.error || !res.data?.value) return { error: res.error || "no_teams" };
  const teams: Team[] = res.data.value.map((t: any) => ({
    id: t.id,
    displayName: t.displayName,
    webUrl: t.webUrl,
  }));
  return { data: teams };
}

export interface Presence {
  availability: string;
  activity: string;
}

export async function getMyPresence(accessToken: string) {
  const path = `/me/presence`;
  const res = await graphFetch<Presence>(accessToken, path);
  return res;
}

export interface DirectoryUser {
  id: string;
  displayName?: string;
  mail?: string;
  jobTitle?: string;
}

export async function searchDirectoryUsers(accessToken: string, query: string, top = 5) {
  if (!query || query.length < 2) return { data: [] };
  const path = `/users?$search="displayName:${query}" OR "mail:${query}"&$top=${top}&$select=id,displayName,mail,jobTitle`;
  // Note: /users search requires ConsistencyLevel: eventual header in some tenants
  const res = await graphFetch<{ value: any[] }>(accessToken, path, {
    headers: { ConsistencyLevel: "eventual" },
  });
  if (res.error || !res.data?.value) return { error: res.error, data: [] };
  const users: DirectoryUser[] = res.data.value.map((u: any) => ({
    id: u.id,
    displayName: u.displayName,
    mail: u.mail,
    jobTitle: u.jobTitle,
  }));
  return { data: users };
}
