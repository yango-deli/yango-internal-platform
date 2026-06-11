"use client";
import { useTranslation } from "next-i18next";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export function SearchBar({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const { t } = useTranslation("hr");
  return (
    <div className="relative flex-1">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input className="pl-9" placeholder={t("searchPlaceholder")} value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}