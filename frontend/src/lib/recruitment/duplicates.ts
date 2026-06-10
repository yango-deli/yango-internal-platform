import { prisma } from "@/lib/prisma";
import { normalizePhone } from "./phone";

export interface DuplicateCheckResult {
  isDuplicate: boolean;
  duplicateOfId?: string;
  matchType?: "phone" | "idNumber" | "email";
  previousStage?: string;
  autoAction?: "mark_irrelevant" | "mark_duplicate_hired";
}

export async function findDuplicate(
  candidate: {
    phone: string;
    email?: string | null;
    idNumber?: string | null;
  },
  excludeId?: string
): Promise<DuplicateCheckResult> {
  const normalizedPhone = normalizePhone(candidate.phone);

  const existing = await prisma.candidate.findMany({
    where: {
      isArchived: false,
      ...(excludeId ? { id: { not: excludeId } } : {}),
    },
    select: {
      id: true,
      phone: true,
      email: true,
      idNumber: true,
      stage: true,
    },
  });

  for (const row of existing) {
    if (normalizePhone(row.phone) === normalizedPhone) {
      return buildResult(row);
    }
  }

  if (candidate.idNumber) {
    const match = existing.find((r) => r.idNumber === candidate.idNumber);
    if (match) return buildResult(match, "idNumber");
  }

  if (candidate.email) {
    const email = candidate.email.toLowerCase();
    const match = existing.find(
      (r) => r.email?.toLowerCase() === email
    );
    if (match) return buildResult(match, "email");
  }

  return { isDuplicate: false };
}

function buildResult(
  row: { id: string; stage: string },
  matchType: "phone" | "idNumber" | "email" = "phone"
): DuplicateCheckResult {
  const result: DuplicateCheckResult = {
    isDuplicate: true,
    duplicateOfId: row.id,
    matchType,
    previousStage: row.stage,
  };

  if (row.stage === "irrelevant") {
    result.autoAction = "mark_irrelevant";
  } else if (row.stage === "hired") {
    result.autoAction = "mark_duplicate_hired";
  }

  return result;
}
