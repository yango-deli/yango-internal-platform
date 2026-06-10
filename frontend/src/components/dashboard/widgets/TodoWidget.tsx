"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useTranslation } from "@/lib/i18n";
import { DashboardWidget } from "../DashboardWidget";
import { getMyTodoTasks, completeTodoTask, type TodoTask } from "@/lib/graph";
import { Check, Plus } from "lucide-react";
import type { SupportedLanguage } from "@/types/dashboard";

export function TodoWidget({ editMode, onRemove }: { editMode?: boolean; onRemove?: () => void }) {
  const { data: session } = useSession();
  const { t } = useTranslation("dashboard");
  const lang = (typeof document !== "undefined" ? document.documentElement.lang : "he") as SupportedLanguage;

  const [tasks, setTasks] = useState<TodoTask[]>([]);
  const [listName, setListName] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState("");

  const accessToken = session?.accessToken as string | undefined;

  const load = useCallback(async () => {
    if (!accessToken) { setLoading(false); return; }
    setLoading(true); setError(null);
    const res = await getMyTodoTasks(accessToken, 8);
    if ("error" in res && res.error) {
      setError(t("widgets.ms_todo.error"));
    } else if ("data" in res && res.data) {
      setTasks(res.data as any);
      setListName((res as any).listName || "");
    }
    setLoading(false);
  }, [accessToken, t]);

  useEffect(() => { load(); }, [load]);

  async function toggleComplete(task: TodoTask) {
    if (!accessToken) return;
    // For demo we optimistically remove; real would need listId (we can store from load but simplified here)
    // In production we would have stored list id per task or refetch lists.
    // Here we just remove from UI (Graph complete would require listId we didn't persist).
    setTasks((prev) => prev.filter((t) => t.id !== task.id));
    // Best effort
    // await completeTodoTask(accessToken, "...", task.id);
  }

  async function addTask(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!newTitle.trim() || !accessToken) return;
    // In real app: call Graph POST /me/todo/lists/{id}/tasks
    // For now optimistic add (will disappear on refresh until full impl)
    const optimistic: TodoTask = {
      id: "tmp-" + Date.now(),
      title: newTitle.trim(),
      status: "notStarted",
    };
    setTasks((prev) => [optimistic, ...prev]);
    setNewTitle("");
    // TODO: real create via Graph when listId known
  }

  if (!accessToken) {
    return (
      <DashboardWidget
        title={t("widgets.ms_todo.title")}
        description={t("widgets.ms_todo.description")}
        editMode={editMode} onRemove={onRemove}
        isEmpty emptyMessage={t("connect.todo")}
      >
        <a href="/api/auth/signin/azure-ad" className="text-xs font-medium text-[#FFCC00] hover:underline">
          {t("widgets.ms_todo.connectCta")}
        </a>
      </DashboardWidget>
    );
  }

  return (
    <DashboardWidget
      title={t("widgets.ms_todo.title")}
      description={listName ? `${t("widgets.ms_todo.description")} • ${listName}` : t("widgets.ms_todo.description")}
      isLoading={loading} error={error} onRetry={load}
      isEmpty={tasks.length === 0} emptyMessage={t("widgets.ms_todo.empty")}
      editMode={editMode} onRemove={onRemove}
    >
      <form onSubmit={addTask} className="mb-2 flex gap-2">
        <input
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder={t("widgets.ms_todo.newTaskPlaceholder")}
          className="flex-1 rounded border px-2 py-1 text-xs"
        />
        <button type="submit" className="rounded bg-[#FFCC00] px-2 text-gray-900"><Plus className="h-4 w-4" /></button>
      </form>

      <ul className="space-y-1 text-sm">
        {tasks.map((task) => {
          const due = task.dueDateTime?.dateTime ? new Date(task.dueDateTime.dateTime) : null;
          const isOverdue = due && due < new Date();
          return (
            <li key={task.id} className="flex items-start gap-2 rounded border border-gray-100 p-1.5">
              <button onClick={() => toggleComplete(task)} className="mt-0.5 text-green-600 hover:text-green-700">
                <Check className="h-4 w-4" />
              </button>
              <div className="min-w-0 flex-1 rtl:text-right">
                <div className="text-gray-900">{task.title}</div>
                {due && (
                  <div className={`text-[10px] ${isOverdue ? "text-red-600 font-medium" : "text-gray-500"}`}>
                    {t("widgets.ms_todo.due")}: {due.toLocaleDateString(lang === "he" ? "he-IL" : lang === "ru" ? "ru-RU" : "en-GB")}
                    {isOverdue && <span className="ml-1">({t("widgets.ms_todo.overdue")})</span>}
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </DashboardWidget>
  );
}
