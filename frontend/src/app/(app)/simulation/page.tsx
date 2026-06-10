"use client";

import { useState } from "react";
import { toast } from "sonner";
import { ConfigForm } from "@/components/simulation/config-form";
import { ResultsTable } from "@/components/simulation/results-table";
import { EmailPreview } from "@/components/simulation/email-preview";
import { SimulationResult, FileConfig, GlobalSettings } from "@/types/simulation";
import { FlaskConical } from "lucide-react";

interface JobResult {
  fileName: string;
  supplierName: string;
  status: "pending" | "done" | "error";
  result?: SimulationResult;
  error?: string;
}

export default function SimulationPage() {
  const [loading, setLoading] = useState(false);
  const [jobs, setJobs] = useState<JobResult[]>([]);
  const [activeTab, setActiveTab] = useState(0);

  const runOne = async (fc: FileConfig, global: GlobalSettings): Promise<SimulationResult> => {
    const fd = new FormData();
    fd.append("file", fc.file);
    fd.append("basket_value_col", fc.basketValueCol);
    fd.append("order_id_col", fc.orderIdCol);
    fd.append("brand_col", fc.brandCol);
    fd.append("quantity_col", fc.quantityCol);
    fd.append("gmv_col", fc.gmvCol);
    fd.append("date_col", fc.dateCol);
    fd.append("uplift_rates", JSON.stringify(global.upliftRates));
    fd.append("basket_tiers_value", JSON.stringify(global.basketTiersValue));
    fd.append("basket_tiers_units", JSON.stringify(global.basketTiersUnits));
    fd.append("delivery_cost_per_order", String(global.deliveryCostPerOrder));
    fd.append("fixed_operational_cost", String(global.fixedOperationalCost));
    fd.append("lookback_days", String(global.lookbackDays));
    fd.append("supplier_name", fc.supplierName);
    fd.append("contact_name", fc.contactName);

    const res = await fetch("/api/simulate", { method: "POST", body: fd });
    const body = await res.json();
    if (!res.ok) throw new Error(body.error ?? "Processing failed");
    return body as SimulationResult;
  };

  const handleSubmit = async (fileConfigs: FileConfig[], global: GlobalSettings) => {
    setLoading(true);
    const initial: JobResult[] = fileConfigs.map(fc => ({
      fileName: fc.file.name,
      supplierName: fc.supplierName || fc.file.name,
      status: "pending",
    }));
    setJobs(initial);
    setActiveTab(0);

    const results = await Promise.allSettled(fileConfigs.map(fc => runOne(fc, global)));

    const final: JobResult[] = results.map((r, i) => {
      if (r.status === "fulfilled") {
        return { ...initial[i], status: "done", result: r.value };
      } else {
        const msg = r.reason instanceof Error ? r.reason.message : "Unknown error";
        return { ...initial[i], status: "error", error: msg };
      }
    });

    setJobs(final);
    setLoading(false);

    const doneCount = final.filter(j => j.status === "done").length;
    const errCount = final.filter(j => j.status === "error").length;
    if (errCount === 0) toast.success(`${doneCount} simulation${doneCount > 1 ? "s" : ""} complete!`);
    else toast.error(`${errCount} simulation${errCount > 1 ? "s" : ""} failed`);
  };

  const activeJob = jobs[activeTab];

  return (
    <div className="max-w-7xl space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Supplier Promo Simulator</h2>
        <p className="text-sm text-gray-500 mt-0.5">
          Upload one or more sellout files and run simulations in parallel.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[360px_1fr] gap-6 items-start">
        {/* Left — config */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FlaskConical className="h-4 w-4 text-[#FFCC00]" />
            Configuration
          </h3>
          <ConfigForm onSubmit={handleSubmit} loading={loading} />
        </div>

        {/* Right — results */}
        <div className="space-y-4">
          {jobs.length === 0 && (
            <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-white p-16 text-gray-400">
              <FlaskConical className="h-12 w-12 mb-4 opacity-30" />
              <p className="text-sm font-medium">Results will appear here</p>
              <p className="text-xs mt-1">Upload files and run simulations to get started</p>
            </div>
          )}

          {jobs.length > 0 && (
            <>
              {/* Tabs */}
              <div className="flex flex-wrap gap-2">
                {jobs.map((job, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveTab(i)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                      activeTab === i
                        ? "bg-gray-900 text-white border-gray-900"
                        : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    {job.status === "pending" && (
                      <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                    )}
                    {job.status === "done" && <span className="text-green-500">●</span>}
                    {job.status === "error" && <span className="text-red-500">●</span>}
                    {job.supplierName || job.fileName}
                  </button>
                ))}
              </div>

              {/* Active result */}
              {activeJob?.status === "pending" && (
                <div className="flex flex-col items-center justify-center rounded-xl border border-gray-200 bg-white p-16 text-gray-500">
                  <svg className="animate-spin h-10 w-10 text-[#FFCC00] mb-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  <p className="text-sm font-medium">Analyzing {activeJob.fileName}...</p>
                </div>
              )}

              {activeJob?.status === "error" && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-6">
                  <p className="text-sm font-semibold text-red-800">Simulation failed — {activeJob.fileName}</p>
                  <p className="text-sm text-red-600 mt-1">{activeJob.error}</p>
                </div>
              )}

              {activeJob?.status === "done" && activeJob.result && (
                <>
                  <ResultsTable result={activeJob.result} />
                  <EmailPreview emailText={activeJob.result.emailText} />
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
