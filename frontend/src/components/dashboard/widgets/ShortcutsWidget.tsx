"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useTranslation } from "@/lib/i18n";
import { DashboardWidget } from "../DashboardWidget";
import { ShortcutTile } from "../shortcuts/ShortcutTile";
import { ShortcutEditModal } from "../shortcuts/ShortcutEditModal";
import { Button } from "@/components/ui/button";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { arrayMove, SortableContext, rectSortingStrategy } from "@dnd-kit/sortable";
import type { UserShortcut } from "@/types/dashboard";
import { Plus } from "lucide-react";

export function ShortcutsWidget({ editMode, onRemove }: { editMode?: boolean; onRemove?: () => void }) {
  const { data: session } = useSession();
  const { t } = useTranslation("dashboard");
  const [shortcuts, setShortcuts] = useState<UserShortcut[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<UserShortcut | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/dashboard/shortcuts");
      const json = await res.json();
      let list: UserShortcut[] = json.shortcuts || [];

      // Seed a few defaults if completely empty (first time users)
      if (list.length === 0) {
        const defaults = [
          { title: t("shortcuts.default.jira") || "Jira", url: "https://jira.yango.com", icon: "📋", color: "blue" },
          { title: t("shortcuts.default.confluence") || "Confluence", url: "https://confluence.yango.com", icon: "📖", color: "green" },
          { title: t("shortcuts.default.hrPortal") || "HR Portal", url: "https://hr.yango.com", icon: "👥", color: "yellow" },
        ];
        // Fire and forget creates
        for (const d of defaults) {
          await fetch("/api/dashboard/shortcuts", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(d) });
        }
        const r2 = await fetch("/api/dashboard/shortcuts");
        const j2 = await r2.json();
        list = j2.shortcuts || [];
      }
      setShortcuts(list);
    } catch {}
    setLoading(false);
  }, [t]);

  useEffect(() => { load(); }, [load]);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  async function handleDragEnd(event: any) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = shortcuts.findIndex((s) => s.id === active.id);
    const newIndex = shortcuts.findIndex((s) => s.id === over.id);
    const newOrder = arrayMove(shortcuts, oldIndex, newIndex);
    setShortcuts(newOrder);

    // Persist reorder
    const order = newOrder.map((s) => s.id);
    await fetch("/api/dashboard/shortcuts/reorder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ order }),
    });
  }

  async function saveShortcut(data: any) {
    if (editing?.id) {
      await fetch(`/api/dashboard/shortcuts/${editing.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
    } else {
      await fetch("/api/dashboard/shortcuts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
    }
    await load();
    setEditing(null);
  }

  async function deleteShortcut(id: string) {
    if (!confirm(t("widgets.shortcuts.deleteConfirm") || "Delete?")) return;
    await fetch(`/api/dashboard/shortcuts/${id}`, { method: "DELETE" });
    await load();
  }

  function openEdit(s?: UserShortcut) {
    setEditing(s || null);
    setModalOpen(true);
  }

  return (
    <>
      <DashboardWidget
        title={t("widgets.shortcuts.title")}
        description={t("widgets.shortcuts.description")}
        isLoading={loading}
        isEmpty={shortcuts.length === 0}
        emptyMessage={t("widgets.shortcuts.empty")}
        headerAction={
          <Button size="sm" variant="outline" className="h-7 px-2 text-xs" onClick={() => openEdit()} disabled={editMode}>
            <Plus className="h-3 w-3 mr-1 rtl:mr-0 rtl:ml-1" /> {t("widgets.shortcuts.add")}
          </Button>
        }
        editMode={editMode}
        onRemove={onRemove}
      >
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={shortcuts.map((s) => s.id)} strategy={rectSortingStrategy}>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {shortcuts.map((sc) => (
                <ShortcutTile
                  key={sc.id}
                  shortcut={sc}
                  editMode={editMode}
                  onEdit={openEdit}
                  onDelete={deleteShortcut}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </DashboardWidget>

      <ShortcutEditModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        initial={editing}
        onSave={saveShortcut}
      />
    </>
  );
}
