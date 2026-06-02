"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { UploadDropzone } from "./upload-dropzone";
import { SimulationConfig } from "@/types/simulation";

const schema = z.object({
  supplierName: z.string().min(1, "Required"),
  contactName: z.string().min(1, "Required"),
  dateCol: z.string().min(1, "Required"),
  orderIdCol: z.string().min(1, "Required"),
  basketValueCol: z.string().min(1, "Required"),
  quantityCol: z.string().min(1, "Required"),
  gmvCol: z.string().min(1, "Required"),
  brandCol: z.string().min(1, "Required"),
  lookbackDays: z.coerce.number().min(1).max(365),
  deliveryCostPerOrder: z.coerce.number().min(0),
  fixedOperationalCost: z.coerce.number().min(0),
});

type FormValues = z.infer<typeof schema>;

interface ConfigFormProps {
  onSubmit: (file: File, config: SimulationConfig) => void;
  loading: boolean;
  uploadProgress: number;
}

export function ConfigForm({ onSubmit, loading, uploadProgress }: ConfigFormProps) {
  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      dateCol: "A",
      orderIdCol: "D",
      basketValueCol: "L",
      quantityCol: "E",
      gmvCol: "F",
      brandCol: "B",
      lookbackDays: 14,
      deliveryCostPerOrder: 15,
      fixedOperationalCost: 5000,
    },
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [upliftRates, setUpliftRates] = useState([0.3, 0.5]);
  const [basketTiers, setBasketTiers] = useState([25, 30, 35]);
  const [unitTiers, setUnitTiers] = useState([2, 3]);

  const toggleValue = (arr: number[], val: number, setter: (v: number[]) => void) => {
    setter(arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val].sort((a, b) => a - b));
  };

  const handleFormSubmit = (values: FormValues) => {
    if (!selectedFile) return;
    onSubmit(selectedFile, {
      ...values,
      upliftRates,
      basketTiersValue: basketTiers,
      basketTiersUnits: unitTiers,
    });
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5">
      {/* File upload */}
      <div>
        <Label className="mb-2 block">Sellout file (.xlsx)</Label>
        <UploadDropzone
          onFileSelect={(f) => setSelectedFile(f)}
          selectedFile={selectedFile}
          uploading={loading}
          uploadProgress={uploadProgress}
        />
        {!selectedFile && (
          <p className="text-xs text-gray-400 mt-1">Upload a file to enable simulation</p>
        )}
      </div>

      <Separator />

      {/* Supplier info */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="supplierName" className="mb-1.5 block">Supplier name</Label>
          <Input id="supplierName" placeholder="Osem" {...register("supplierName")} />
          {errors.supplierName && <p className="text-xs text-red-500 mt-1">{errors.supplierName.message}</p>}
        </div>
        <div>
          <Label htmlFor="contactName" className="mb-1.5 block">Contact name</Label>
          <Input id="contactName" placeholder="David Cohen" {...register("contactName")} />
          {errors.contactName && <p className="text-xs text-red-500 mt-1">{errors.contactName.message}</p>}
        </div>
      </div>

      <Separator />

      {/* Column mapping */}
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Column mapping</p>
        <div className="grid grid-cols-2 gap-3">
          {[
            { id: "dateCol", label: "Date column", placeholder: "A" },
            { id: "orderIdCol", label: "Order ID column", placeholder: "D" },
            { id: "basketValueCol", label: "Basket value (NIS)", placeholder: "L" },
            { id: "quantityCol", label: "Units sold", placeholder: "E" },
            { id: "gmvCol", label: "GMV / Revenue", placeholder: "F" },
            { id: "brandCol", label: "Brand / Type", placeholder: "B" },
          ].map(({ id, label, placeholder }) => (
            <div key={id}>
              <Label htmlFor={id} className="mb-1.5 block text-xs">{label}</Label>
              <Input
                id={id}
                placeholder={placeholder}
                className="text-xs"
                {...register(id as keyof FormValues)}
              />
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-2">Use column letters (A, B, C…) or exact header names</p>
      </div>

      <Separator />

      {/* Tier configuration */}
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Basket value tiers (NIS)</p>
        <div className="flex flex-wrap gap-2">
          {[20, 25, 30, 35, 40, 50].map((val) => (
            <button
              key={val}
              type="button"
              onClick={() => toggleValue(basketTiers, val, setBasketTiers)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border ${
                basketTiers.includes(val)
                  ? "bg-[#FFCC00] border-[#FFCC00] text-gray-900"
                  : "border-gray-200 text-gray-600 hover:border-gray-300"
              }`}
            >
              {val}+ ₪
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Unit quantity tiers</p>
        <div className="flex flex-wrap gap-2">
          {[1, 2, 3, 4, 5].map((val) => (
            <button
              key={val}
              type="button"
              onClick={() => toggleValue(unitTiers, val, setUnitTiers)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border ${
                unitTiers.includes(val)
                  ? "bg-[#FFCC00] border-[#FFCC00] text-gray-900"
                  : "border-gray-200 text-gray-600 hover:border-gray-300"
              }`}
            >
              {val}+ units
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Uplift scenarios</p>
        <div className="flex flex-wrap gap-2">
          {[0.1, 0.2, 0.3, 0.4, 0.5, 0.75].map((val) => (
            <button
              key={val}
              type="button"
              onClick={() => toggleValue(upliftRates, val, setUpliftRates)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border ${
                upliftRates.includes(val)
                  ? "bg-[#FFCC00] border-[#FFCC00] text-gray-900"
                  : "border-gray-200 text-gray-600 hover:border-gray-300"
              }`}
            >
              +{(val * 100).toFixed(0)}%
            </button>
          ))}
        </div>
      </div>

      <Separator />

      {/* Cost params */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="deliveryCostPerOrder" className="mb-1.5 block text-xs">Delivery cost / order (NIS)</Label>
          <Input id="deliveryCostPerOrder" type="number" step="1" {...register("deliveryCostPerOrder")} />
        </div>
        <div>
          <Label htmlFor="fixedOperationalCost" className="mb-1.5 block text-xs">Fixed operational cost (NIS)</Label>
          <Input id="fixedOperationalCost" type="number" step="100" {...register("fixedOperationalCost")} />
        </div>
        <div className="col-span-2">
          <Label htmlFor="lookbackDays" className="mb-1.5 block text-xs">Lookback window (days)</Label>
          <Input id="lookbackDays" type="number" min="1" max="365" {...register("lookbackDays")} />
        </div>
      </div>

      <Button
        type="submit"
        size="lg"
        className="w-full"
        disabled={!selectedFile || loading || basketTiers.length === 0 || unitTiers.length === 0 || upliftRates.length === 0}
      >
        {loading ? (
          <>
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Processing...
          </>
        ) : (
          "Run Simulation →"
        )}
      </Button>
    </form>
  );
}

