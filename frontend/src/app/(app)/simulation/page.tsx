"use client";

import { useState } from "react";
import { toast } from "sonner";
import { ConfigForm } from "@/components/simulation/config-form";
import { ResultsTable } from "@/components/simulation/results-table";
import { EmailPreview } from "@/components/simulation/email-preview";
import { SimulationResult, SimulationConfig } from "@/types/simulation";
import { FlaskConical } from "lucide-react";

type Status = "idle" | "uploading" | "done" | "error";

export default function SimulationPage() {
  const [status, setStatus] = useState<Status>("idle");
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSimulate = async (file: File, config: SimulationConfig) => {
    setStatus("uploading");
    setUploadProgress(0);
    setErrorMsg(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("config", JSON.stringify(config));
    formData.append("basket_value_col", config.basketValueCol);
    formData.append("order_id_col", config.orderIdCol);
    formData.append("brand_col", config.brandCol);
    formData.append("quantity_col", config.quantityCol);
    formData.append("gmv_col", config.gmvCol);
    formData.append("date_col", config.dateCol);
    formData.append("uplift_rates", JSON.stringify(config.upliftRates));
    formData.append("basket_tiers_value", JSON.stringify(config.basketTiersValue));
    formData.append("basket_tiers_units", JSON.stringify(config.basketTiersUnits));
    formData.append("delivery_cost_per_order", String(config.deliveryCostPerOrder));
    formData.append("fixed_operational_cost", String(config.fixedOperationalCost));
    formData.append("lookback_days", String(config.lookbackDays));
    formData.append("supplier_name", config.supplierName);
    formData.append("contact_name", config.contactName);

    // Use XHR for upload progress
    try {
      const data = await new Promise<SimulationResult>((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        xhr.upload.addEventListener("progress", (e) => {
          if (e.lengthComputable) {
            setUploadProgress(Math.round((e.loaded / e.total) * 80));
          }
        });

        xhr.addEventListener("load", () => {
          setUploadProgress(100);
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(JSON.parse(xhr.responseText));
          } else {
            const body = JSON.parse(xhr.responseText ?? "{}");
            reject(new Error(body.error ?? "Processing failed"));
          }
        });

        xhr.addEventListener("error", () => reject(new Error("Network error")));

        xhr.open("POST", "/api/simulate");
        xhr.send(formData);
      });

      setResult(data);
      setStatus("done");
      toast.success("Simulation complete!");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      setErrorMsg(msg);
      setStatus("error");
      toast.error(`Simulation failed: ${msg}`);
    }
  };

  return (
    <div className="max-w-7xl space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Supplier Promo Simulator</h2>
        <p className="text-sm text-gray-500 mt-0.5">
          Upload a sellout file and configure parameters to generate a promotion proposal.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[380px_1fr] gap-6 items-start">
        {/* Left — config */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FlaskConical className="h-4 w-4 text-[#FFCC00]" />
            Configuration
          </h3>
          <ConfigForm
            onSubmit={handleSimulate}
            loading={status === "uploading"}
            uploadProgress={uploadProgress}
          />
        </div>

        {/* Right — results */}
        <div className="space-y-5">
          {status === "idle" && (
            <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-white p-16 text-gray-400">
              <FlaskConical className="h-12 w-12 mb-4 opacity-30" />
              <p className="text-sm font-medium">Results will appear here</p>
              <p className="text-xs mt-1">Configure and run a simulation to get started</p>
            </div>
          )}

          {status === "uploading" && (
            <div className="flex flex-col items-center justify-center rounded-xl border border-gray-200 bg-white p-16 text-gray-500">
              <svg className="animate-spin h-10 w-10 text-[#FFCC00] mb-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <p className="text-sm font-medium">Analyzing data...</p>
              <p className="text-xs text-gray-400 mt-1">{uploadProgress}% complete</p>
            </div>
          )}

          {status === "error" && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-6">
              <p className="text-sm font-semibold text-red-800">Simulation failed</p>
              <p className="text-sm text-red-600 mt-1">{errorMsg}</p>
            </div>
          )}

          {status === "done" && result && (
            <>
              <ResultsTable result={result} />
              <EmailPreview emailText={result.emailText} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
