"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, FileSpreadsheet, Settings2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { MultiUploadDropzone } from "./upload-dropzone";
import { FileConfig, GlobalSettings, DEFAULT_FILE_COLS, DEFAULT_GLOBAL } from "@/types/simulation";

interface ConfigFormProps {
  onSubmit: (files: FileConfig[], global: GlobalSettings) => void;
  loading: boolean;
}

function toggleArr(arr: number[], val: number): number[] {
  return arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val].sort((a, b) => a - b);
}

type FileConfigStringKey = "supplierName" | "contactName" | "dateCol" | "orderIdCol" | "basketValueCol" | "quantityCol" | "gmvCol" | "brandCol";

function FileCard({
  config,
  index,
  onChange,
  onRemove,
  disabled,
}: {
  config: FileConfig;
  index: number;
  onChange: (updated: FileConfig) => void;
  onRemove: () => void;
  disabled: boolean;
}) {
  const [open, setOpen] = useState(true);
  const set = (k: FileConfigStringKey, v: string) => onChange({ ...config, [k]: v });

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <div
        className="flex items-center gap-2 px-3 py-2.5 bg-gray-50 cursor-pointer select-none"
        onClick={() => setOpen(o => !o)}
      >
        <FileSpreadsheet className="h-4 w-4 text-gray-500 flex-shrink-0" />
        <span className="flex-1 text-xs font-medium text-gray-800 truncate">{config.file.name}</span>
        {config.supplierName && (
          <span className="text-xs text-gray-400 truncate max-w-[80px]">{config.supplierName}</span>
        )}
        {!disabled && (
          <button
            type="button"
            onClick={e => { e.stopPropagation(); onRemove(); }}
            className="text-gray-400 hover:text-red-500 ml-1 text-xs leading-none"
          >✕</button>
        )}
        {open ? <ChevronUp className="h-3.5 w-3.5 text-gray-400" /> : <ChevronDown className="h-3.5 w-3.5 text-gray-400" />}
      </div>

      {open && (
        <div className="p-3 space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="mb-1 block text-xs">Supplier name</Label>
              <Input className="text-xs h-8" placeholder="Osem" value={config.supplierName}
                onChange={e => set("supplierName", e.target.value)} disabled={disabled} />
            </div>
            <div>
              <Label className="mb-1 block text-xs">Contact name</Label>
              <Input className="text-xs h-8" placeholder="David Cohen" value={config.contactName}
                onChange={e => set("contactName", e.target.value)} disabled={disabled} />
            </div>
          </div>

          <div>
            <p className="text-xs font-medium text-gray-500 mb-2">Column mapping</p>
            <div className="grid grid-cols-3 gap-2">
              {([
                ["dateCol", "Date"],
                ["orderIdCol", "Order ID"],
                ["basketValueCol", "Basket (NIS)"],
                ["quantityCol", "Units"],
                ["gmvCol", "GMV"],
                ["brandCol", "Brand"],
              ] as [FileConfigStringKey, string][]).map(([key, label]) => (
                <div key={key}>
                  <Label className="mb-0.5 block text-xs text-gray-500">{label}</Label>
                  <Input
                    className="text-xs h-7 px-2"
                    value={config[key]}
                    onChange={e => set(key, e.target.value)}
                    disabled={disabled}
                  />
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-1.5">Column letters (A, B…) or exact header names</p>
          </div>
        </div>
      )}
    </div>
  );
}

export function ConfigForm({ onSubmit, loading }: ConfigFormProps) {
  const [fileConfigs, setFileConfigs] = useState<FileConfig[]>([]);
  const [global, setGlobal] = useState<GlobalSettings>(DEFAULT_GLOBAL);
  const [globalOpen, setGlobalOpen] = useState(false);

  const handleAdd = (newFiles: File[]) => {
    const next: FileConfig[] = newFiles.map(f => ({
      id: Math.random().toString(36).slice(2),
      file: f,
      supplierName: "",
      contactName: "",
      ...DEFAULT_FILE_COLS,
    }));
    setFileConfigs(prev => [...prev, ...next]);
  };

  const handleRemove = (index: number) => {
    setFileConfigs(prev => prev.filter((_, i) => i !== index));
  };

  const handleFileChange = (index: number, updated: FileConfig) => {
    setFileConfigs(prev => prev.map((c, i) => i === index ? updated : c));
  };

  const setG = (k: keyof GlobalSettings, v: unknown) => setGlobal(g => ({ ...g, [k]: v }));

  const canSubmit = fileConfigs.length > 0 && !loading;

  return (
    <div className="space-y-4">
      {/* Global settings */}
      <div className="border border-gray-200 rounded-xl overflow-hidden">
        <div
          className="flex items-center gap-2 px-3 py-2.5 bg-gray-50 cursor-pointer select-none"
          onClick={() => setGlobalOpen(o => !o)}
        >
          <Settings2 className="h-4 w-4 text-gray-500" />
          <span className="flex-1 text-xs font-semibold text-gray-700">Global Settings</span>
          {globalOpen ? <ChevronUp className="h-3.5 w-3.5 text-gray-400" /> : <ChevronDown className="h-3.5 w-3.5 text-gray-400" />}
        </div>

        {globalOpen && (
          <div className="p-3 space-y-3">
            <div>
              <p className="text-xs font-medium text-gray-500 mb-2">Basket value tiers (NIS)</p>
              <div className="flex flex-wrap gap-1.5">
                {[20, 25, 30, 35, 40, 50].map(v => (
                  <button key={v} type="button" disabled={loading}
                    onClick={() => setG("basketTiersValue", toggleArr(global.basketTiersValue, v))}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
                      global.basketTiersValue.includes(v) ? "bg-[#FFCC00] border-[#FFCC00] text-gray-900" : "border-gray-200 text-gray-600 hover:border-gray-300"
                    }`}>{v}+ ₪</button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs font-medium text-gray-500 mb-2">Unit quantity tiers</p>
              <div className="flex flex-wrap gap-1.5">
                {[1, 2, 3, 4, 5].map(v => (
                  <button key={v} type="button" disabled={loading}
                    onClick={() => setG("basketTiersUnits", toggleArr(global.basketTiersUnits, v))}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
                      global.basketTiersUnits.includes(v) ? "bg-[#FFCC00] border-[#FFCC00] text-gray-900" : "border-gray-200 text-gray-600 hover:border-gray-300"
                    }`}>{v}+ units</button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs font-medium text-gray-500 mb-2">Uplift scenarios</p>
              <div className="flex flex-wrap gap-1.5">
                {[0.1, 0.2, 0.3, 0.4, 0.5, 0.75].map(v => (
                  <button key={v} type="button" disabled={loading}
                    onClick={() => setG("upliftRates", toggleArr(global.upliftRates, v))}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
                      global.upliftRates.includes(v) ? "bg-[#FFCC00] border-[#FFCC00] text-gray-900" : "border-gray-200 text-gray-600 hover:border-gray-300"
                    }`}>+{(v * 100).toFixed(0)}%</button>
                ))}
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="mb-1 block text-xs">Delivery cost / order (NIS)</Label>
                <Input type="number" className="text-xs h-8" value={global.deliveryCostPerOrder}
                  onChange={e => setG("deliveryCostPerOrder", Number(e.target.value))} disabled={loading} />
              </div>
              <div>
                <Label className="mb-1 block text-xs">Fixed operational cost (NIS)</Label>
                <Input type="number" className="text-xs h-8" value={global.fixedOperationalCost}
                  onChange={e => setG("fixedOperationalCost", Number(e.target.value))} disabled={loading} />
              </div>
              <div className="col-span-2">
                <Label className="mb-1 block text-xs">Lookback window (days)</Label>
                <Input type="number" className="text-xs h-8" value={global.lookbackDays}
                  onChange={e => setG("lookbackDays", Number(e.target.value))} disabled={loading} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Per-file configs */}
      {fileConfigs.map((config, i) => (
        <FileCard
          key={config.id}
          config={config}
          index={i}
          onChange={updated => handleFileChange(i, updated)}
          onRemove={() => handleRemove(i)}
          disabled={loading}
        />
      ))}

      {/* Drop zone */}
      <MultiUploadDropzone
        files={[]}
        onAdd={handleAdd}
        onRemove={() => {}}
        disabled={loading}
      />

      <Button
        type="button"
        size="lg"
        className="w-full"
        disabled={!canSubmit}
        onClick={() => onSubmit(fileConfigs, global)}
      >
        {loading ? (
          <><svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>Processing...</>
        ) : (
          `Run ${fileConfigs.length > 1 ? `${fileConfigs.length} Simulations` : "Simulation"} →`
        )}
      </Button>
    </div>
  );
}
