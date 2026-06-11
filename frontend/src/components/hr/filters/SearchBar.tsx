"use client";
import { useTranslation } from "next-i18next";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";

export function SearchBar({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const { t } = useTranslation("hr");
  const [local, setLocal] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => onChange(local), 300);
    return () => clearTimeout(timer);
  }, [local]);
  return (
    <div className="relative flex-1">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input className="pl-9" placeholder={t("searchPlaceholder")} value={local} onChange={(e) => setLocal(e.target.value)} />
    </div>
  );
}