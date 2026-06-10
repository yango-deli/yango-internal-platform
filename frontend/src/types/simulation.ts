export interface TierResult {
  tierType: "basket_value" | "units";
  tier: string;
  upliftRate: number;
  forecastedRedemptions: number;
  deliveryBudget: number;
  fixedOperationalCost: number;
  finalActivityCost: number;
}

export interface BrandSummary {
  brand: string;
  quantity: number;
  gmv: number;
}

export interface SimulationResult {
  tierResults: TierResult[];
  brandSummary: BrandSummary[];
  emailText: string;
  xlsxBase64: string;
  runId: string;
  dateRangeUsed: { from: string; to: string };
  totalOrdersAnalyzed: number;
}

export interface SimulationConfig {
  basketValueCol: string;
  orderIdCol: string;
  brandCol: string;
  quantityCol: string;
  gmvCol: string;
  dateCol: string;
  upliftRates: number[];
  basketTiersValue: number[];
  basketTiersUnits: number[];
  deliveryCostPerOrder: number;
  fixedOperationalCost: number;
  lookbackDays: number;
  supplierName: string;
  contactName: string;
}

// Per-file config (everything except global tier/cost/uplift settings)
export interface FileConfig {
  id: string;           // uuid, client-only
  file: File;
  supplierName: string;
  contactName: string;
  dateCol: string;
  orderIdCol: string;
  basketValueCol: string;
  quantityCol: string;
  gmvCol: string;
  brandCol: string;
}

// Global settings shared across all files
export interface GlobalSettings {
  upliftRates: number[];
  basketTiersValue: number[];
  basketTiersUnits: number[];
  deliveryCostPerOrder: number;
  fixedOperationalCost: number;
  lookbackDays: number;
}

export const DEFAULT_FILE_COLS = {
  dateCol: "A",
  orderIdCol: "D",
  basketValueCol: "L",
  quantityCol: "E",
  gmvCol: "F",
  brandCol: "B",
};

export const DEFAULT_GLOBAL: GlobalSettings = {
  upliftRates: [0.3, 0.5],
  basketTiersValue: [25, 30, 35],
  basketTiersUnits: [2, 3],
  deliveryCostPerOrder: 15,
  fixedOperationalCost: 5000,
  lookbackDays: 14,
};
