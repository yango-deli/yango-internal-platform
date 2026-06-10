"use client";

import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Edit2, ExternalLink, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { UserShortcut } from "@/types/dashboard";

interface ShortcutTileProps {
  shortcut: UserShortcut;
  onEdit?: (s: UserShortcut) => void;
  onDelete?: (id: string) => void;
  editMode?: boolean;
  openInNewTab?: boolean;
}

const colorMap: Record<string, string> = {
  yellow: "bg-yellow-400 text-gray-900",
  blue: "bg-blue-500 text-white",
  green: "bg-green-500 text-white",
  red: "bg-red-500 text-white",
  purple: "bg-purple-500 text-white",
  gray: "bg-gray-500 text-white",
};

export function ShortcutTile({
  shortcut,
  onEdit,
  onDelete,
  editMode,
  openInNewTab,
}: ShortcutTileProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: shortcut.id,
    disabled: !editMode,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  };

  const colorClass = shortcut.color && colorMap[shortcut.color] ? colorMap[shortcut.color] : "bg-gray-200 text-gray-800";

  const handleClick = () => {
    if (editMode) return;
    const target = shortcut.openInNewTab || openInNewTab ? "_blank" : "_self";
    window.open(shortcut.url, target, "noopener,noreferrer");
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group relative flex flex-col items-center justify-center gap-1.5 rounded-xl border border-gray-200 bg-white p-3 text-center transition-all hover:shadow-sm active:scale-[0.985] cursor-pointer select-none",
        editMode && "cursor-grab active:cursor-grabbing"
      )}
      onClick={handleClick}
      {...(editMode ? { ...attributes, ...listeners } : {})}
    >
      <div
        className={cn(
          "flex h-10 w-10 items-center justify-center rounded-xl text-xl shadow-inner",
          colorClass
        )}
      >
        {shortcut.icon || "🔗"}
      </div>
      <div className="w-full truncate text-xs font-medium text-gray-800">{shortcut.title}</div>

      {/* Actions */}
      {editMode && (
        <div className="absolute right-1 top-1 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
          {onEdit && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(shortcut);
              }}
              className="rounded bg-white/90 p-1 text-gray-500 hover:text-blue-600 shadow"
              title="Edit"
            >
              <Edit2 className="h-3 w-3" />
            </button>
          )}
          {onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(shortcut.id);
              }}
              className="rounded bg-white/90 p-1 text-gray-500 hover:text-red-600 shadow"
              title="Delete"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          )}
        </div>
      )}

      {!editMode && (shortcut.openInNewTab || openInNewTab) && (
        <ExternalLink className="absolute bottom-1.5 right-1.5 h-3 w-3 text-gray-400 opacity-60" />
      )}
    </div>
  );
}
