"use client";

import React, { useState } from "react";
import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";
import { useTranslation } from "@/lib/i18n";

interface EmojiIconPickerProps {
  value: string;
  onChange: (emoji: string) => void;
  onClose?: () => void;
}

export function EmojiIconPicker({ value, onChange, onClose }: EmojiIconPickerProps) {
  const { t } = useTranslation("dashboard");
  const [show, setShow] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-300 bg-white text-2xl hover:bg-gray-50"
        title={value || "Pick emoji"}
      >
        {value || "😊"}
      </button>

      {show && (
        <div className="absolute z-50 mt-2 right-0 rtl:left-0 rtl:right-auto shadow-xl rounded-xl overflow-hidden border bg-white">
          <div className="p-1">
            <Picker
              data={data}
              onEmojiSelect={(e: any) => {
                onChange(e.native || e.emoji || "🔗");
                setShow(false);
                onClose?.();
              }}
              locale="en" // emoji-mart search stays english for simplicity; labels via our i18n elsewhere
              theme="light"
              searchPlaceholder={t("widgets.shortcuts.modal.emojiSearch") || "Search emoji..."}
            />
          </div>
          <button
            onClick={() => setShow(false)}
            className="w-full py-1 text-xs text-gray-500 hover:bg-gray-100 border-t"
          >
            {t("buttons.close") || "Close"}
          </button>
        </div>
      )}
    </div>
  );
}
