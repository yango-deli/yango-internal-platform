export interface CandidateListItem {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email?: string | null;
  source: string;
  workerType?: string | null;
  city?: string | null;
  stage: string;
  isDuplicate: boolean;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  position?: { id: string; title: string } | null;
  assignedTo?: {
    id: string;
    name: string | null;
    image: string | null;
    email: string;
  } | null;
  _count?: { notes: number; activities: number };
}

export interface CandidateDetail extends CandidateListItem {
  idNumber?: string | null;
  sourceDetail?: string | null;
  vehicleType?: string | null;
  duplicateOfId?: string | null;
  formData?: Record<string, unknown> | null;
  stageHistory?: Array<{
    id: string;
    fromStage: string;
    toStage: string;
    reason?: string | null;
    createdAt: string;
    changedBy: { id: string; name: string | null; image: string | null };
  }>;
  notes?: Array<{
    id: string;
    content: string;
    isPinned: boolean;
    createdAt: string;
    author: { id: string; name: string | null; image: string | null };
  }>;
  activities?: Array<{
    id: string;
    type: string;
    description: string;
    metadata?: Record<string, unknown> | null;
    createdAt: string;
    user: { id: string; name: string | null; image: string | null };
  }>;
}
