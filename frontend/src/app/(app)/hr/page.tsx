"use client";
import { useState } from "react";
import { useTranslation } from "next-i18next";
import { useSession } from "next-auth/react";
import { Plus, Download, LayoutGrid, Table2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WorkerCard } from "@/components/hr/WorkerCard";
import { WorkerTable } from "@/components/hr/WorkerTable";
import { WorkerFilters } from "@/components/hr/filters/WorkerFilters";
import { SearchBar } from "@/components/hr/filters/SearchBar";
import WorkerFormModal from "@/components/hr/forms/WorkerFormModal";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";

export default function HRPage() {
  const { t, i18n } = useTranslation("hr");
  const { data: session } = useSession();
  const role = (session?.user as any)?.role;
  const isRTL = i18n.language === "he";

  const [view, setView] = useState<"card" | "table">("card");
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Record<string, any>>({});
  const [showAdd, setShowAdd] = useState(false);

  const params = new URLSearchParams();
  if (search) params.set("search", search);
  Object.entries(filters).forEach(([k, v]) => {
    if (Array.isArray(v)) v.forEach((item) => params.append(k, item));
    else if (v) params.set(k, v);
  });

  const { data: workers, mutate } = useSWR(`/api/hr/workers?${params}`, fetcher, { revalidateOnFocus: false });

  const handleExport = () => {
    const ep = new URLSearchParams(params);
    ep.set("export", "excel");
    ep.set("lang", i18n.language);
    window.open(`/api/hr/workers?${ep}`, "_blank");
  };

  return (
    <div dir={isRTL ? "rtl" : "ltr"} className="p-6 space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <div className="flex items-center gap-2 flex-wrap">
          {role === "admin" && (
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />{t("exportExcel")}
            </Button>
          )}
          {["admin", "manager"].includes(role) && (
            <Button size="sm" onClick={() => setShowAdd(true)}>
              <Plus className="h-4 w-4 mr-2" />{t("addWorker")}
            </Button>
          )}
          <Button variant={view === "card" ? "default" : "outline"} size="sm" onClick={() => setView("card")}>
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button variant={view === "table" ? "default" : "outline"} size="sm" onClick={() => setView("table")}>
            <Table2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="flex flex-col md:flex-row gap-3">
        <SearchBar value={search} onChange={setSearch} />
        <WorkerFilters filters={filters} onChange={setFilters} />
      </div>
      {!workers ? (
        <p className="text-muted-foreground">{t("common.loading")}</p>
      ) : workers.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-lg font-medium">{t("noWorkers")}</p>
          <p className="text-sm">{t("noWorkersDesc")}</p>
        </div>
      ) : view === "card" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {workers.map((w: any) => <WorkerCard key={w.id} worker={w} onUpdate={mutate} />)}
        </div>
      ) : (
        <WorkerTable workers={workers} onUpdate={mutate} />
      )}
      {showAdd && (
        <WorkerFormModal open={showAdd} onClose={() => setShowAdd(false)} onSuccess={() => { setShowAdd(false); mutate(); }} />
      )}
    </div>
  );
}