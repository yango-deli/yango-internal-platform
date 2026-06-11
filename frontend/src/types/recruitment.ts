export const RECRUITMENT_STAGES = [
  "new",
  "contacted",
  "screening",
  "interview_scheduled",
  "interview_done",
  "offer_sent",
  "hired",
  "rejected",
  "irrelevant",
  "on_hold",
] as const;

export type RecruitmentStage = (typeof RECRUITMENT_STAGES)[number];

export const WORKER_TYPES = ["courier", "store", "office"] as const;
export type WorkerType = (typeof WORKER_TYPES)[number];

export const CANDIDATE_SOURCES = [
  "website",
  "facebook",
  "manual",
  "referral",
] as const;
export type CandidateSource = (typeof CANDIDATE_SOURCES)[number];

export const STAGE_COLORS: Record<RecruitmentStage, string> = {
  new: "bg-gray-100 border-gray-300 text-gray-800",
  contacted: "bg-blue-100 border-blue-300 text-blue-800",
  screening: "bg-yellow-100 border-yellow-300 text-yellow-800",
  interview_scheduled: "bg-orange-100 border-orange-300 text-orange-800",
  interview_done: "bg-purple-100 border-purple-300 text-purple-800",
  offer_sent: "bg-teal-100 border-teal-300 text-teal-800",
  hired: "bg-green-100 border-green-300 text-green-800",
  rejected: "bg-red-100 border-red-300 text-red-800",
  irrelevant: "bg-slate-100 border-slate-300 text-slate-800",
  on_hold: "bg-amber-100 border-amber-300 text-amber-800",
};

// Solid accent color per stage (for dots, accent strips). Semantic, limited palette.
export const STAGE_ACCENT: Record<RecruitmentStage, string> = {
  new: "bg-gray-400",
  contacted: "bg-blue-500",
  screening: "bg-yellow-500",
  interview_scheduled: "bg-orange-500",
  interview_done: "bg-purple-500",
  offer_sent: "bg-teal-500",
  hired: "bg-green-500",
  rejected: "bg-red-500",
  irrelevant: "bg-slate-400",
  on_hold: "bg-amber-500",
};

export const STAGES_REQUIRING_REASON: RecruitmentStage[] = [
  "rejected",
  "irrelevant",
];

export interface RawCandidate {
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  idNumber?: string;
  source: string;
  sourceDetail?: string;
  workerType?: string;
  city?: string;
  vehicleType?: string;
  positionId?: string;
  tags?: string[];
  formData?: Record<string, unknown>;
}

export interface ImportResult {
  imported: number;
  duplicates: number;
  errors: { row: number; message: string }[];
  candidateIds: string[];
}

export interface CandidateFilters {
  source?: string;
  workerType?: string;
  assignedToId?: string;
  dateFrom?: string;
  dateTo?: string;
  tags?: string[];
  search?: string;
}
