"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch"; // will create if missing
import { EmojiIconPicker } from "./EmojiIconPicker";
import { useTranslation } from "@/lib/i18n";
import type { UserShortcut } from "@/types/dashboard";

interface ShortcutEditModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial?: Partial<UserShortcut> | null;
  onSave: (data: {
    title: string;
    url: string;
    icon?: string;
    color?: string;
    openInNewTab: boolean;
  }) => Promise<void> | void;
}

const COLORS = [
  { name: "yellow", class: "bg-yellow-400" },
  { name: "blue", class: "bg-blue-500" },
  { name: "green", class: "bg-green-500" },
  { name: "red", class: "bg-red-500" },
  { name: "purple", class: "bg-purple-500" },
  { name: "gray", class: "bg-gray-500" },
];

export function ShortcutEditModal({ open, onOpenChange, initial, onSave }: ShortcutEditModalProps) {
  const { t } = useTranslation("dashboard");
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [icon, setIcon] = useState("🔗");
  const [color, setColor] = useState("yellow");
  const [openInNewTab, setOpenInNewTab] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (initial) {
      setTitle(initial.title || "");
      setUrl(initial.url || "");
      setIcon(initial.icon || "🔗");
      setColor(initial.color || "yellow");
      setOpenInNewTab(initial.openInNewTab ?? true);
    } else {
      setTitle("");
      setUrl("");
      setIcon("🔗");
      setColor("yellow");
      setOpenInNewTab(true);
    }
  }, [initial, open]);

  async function handleSave() {
    if (!title.trim() || !url.trim()) return;
    setSaving(true);
    try {
      await onSave({
        title: title.trim(),
        url: url.trim(),
        icon: icon || undefined,
        color,
        openInNewTab,
      });
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle>
            {initial?.id ? t("widgets.shortcuts.modal.editTitle") : t("widgets.shortcuts.modal.title")}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="title">{t("widgets.shortcuts.modal.fields.title")}</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t("widgets.shortcuts.modal.fields.titlePlaceholder")}
              maxLength={120}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="url">{t("widgets.shortcuts.modal.fields.url")}</Label>
            <Input
              id="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder={t("widgets.shortcuts.modal.fields.urlPlaceholder")}
              type="url"
            />
          </div>

          <div className="flex items-end gap-3">
            <div>
              <Label>{t("widgets.shortcuts.modal.fields.icon")}</Label>
              <div className="mt-1.5">
                <EmojiIconPicker value={icon} onChange={setIcon} />
              </div>
            </div>

            <div className="flex-1 space-y-1.5">
              <Label>{t("widgets.shortcuts.modal.fields.color")}</Label>
              <div className="flex gap-2 pt-1">
                {COLORS.map((c) => (
                  <button
                    key={c.name}
                    type="button"
                    onClick={() => setColor(c.name)}
                    className={cn(
                      "h-7 w-7 rounded-full ring-1 ring-offset-2",
                      c.class,
                      color === c.name ? "ring-gray-900" : "ring-transparent"
                    )}
                    title={t(`widgets.shortcuts.modal.colors.${c.name}`) || c.name}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between rounded-lg border p-3">
            <Label htmlFor="openNew" className="text-sm">
              {t("widgets.shortcuts.modal.fields.openInNewTab")}
            </Label>
            <Switch
              id="openNew"
              checked={openInNewTab}
              onCheckedChange={setOpenInNewTab}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            {t("buttons.cancel")}
          </Button>
          <Button onClick={handleSave} disabled={saving || !title.trim() || !url.trim()}>
            {t("buttons.save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(" ");
}
