"use client";

import { useState } from "react";
import { Pin, Trash2 } from "lucide-react";
import { useI18n } from "@/components/providers/i18n-provider";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { formatDate } from "@/lib/recruitment/format";

export function NotesList({
  notes,
  onAdd,
  onTogglePin,
  onDelete,
}: {
  notes: Array<{
    id: string;
    content: string;
    isPinned: boolean;
    createdAt: string;
    author: { name: string | null };
  }>;
  onAdd: (content: string) => Promise<void>;
  onTogglePin: (id: string, isPinned: boolean) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  const { t } = useI18n();
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={t("panel.addNote")}
          rows={3}
        />
        <Button
          size="sm"
          disabled={!content.trim() || loading}
          onClick={async () => {
            setLoading(true);
            await onAdd(content.trim());
            setContent("");
            setLoading(false);
          }}
        >
          {t("form.save")}
        </Button>
      </div>

      {!notes.length ? (
        <p className="text-sm text-gray-400 text-center py-4">
          {t("panel.noNotes")}
        </p>
      ) : (
        <div className="space-y-3">
          {notes.map((note) => (
            <div
              key={note.id}
              className="p-3 rounded-lg border bg-gray-50"
            >
              <p className="text-sm text-gray-900 whitespace-pre-wrap">
                {note.content}
              </p>
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-gray-400">
                  {note.author.name} · {formatDate(note.createdAt)}
                </span>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => onTogglePin(note.id, !note.isPinned)}
                    className="p-1 text-gray-400 hover:text-gray-700"
                    title={note.isPinned ? t("panel.unpin") : t("panel.pin")}
                  >
                    <Pin className={`h-3.5 w-3.5 ${note.isPinned ? "fill-current" : ""}`} />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(note.id)}
                    className="p-1 text-gray-400 hover:text-red-600"
                    title={t("panel.delete")}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
