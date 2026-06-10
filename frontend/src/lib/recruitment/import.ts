import { prisma } from "@/lib/prisma";
import { findDuplicate } from "./duplicates";
import { normalizePhone } from "./phone";
import type { ImportResult, RawCandidate } from "@/types/recruitment";

export async function processCandidates(
  candidates: RawCandidate[],
  userId: string,
  options?: { overrideDuplicates?: boolean }
): Promise<ImportResult> {
  const result: ImportResult = {
    imported: 0,
    duplicates: 0,
    errors: [],
    candidateIds: [],
  };

  for (let i = 0; i < candidates.length; i++) {
    const raw = candidates[i];
    try {
      if (!raw.firstName?.trim() || !raw.lastName?.trim() || !raw.phone?.trim()) {
        result.errors.push({ row: i + 1, message: "missing_required_fields" });
        continue;
      }

      const dup = await findDuplicate({
        phone: raw.phone,
        email: raw.email,
        idNumber: raw.idNumber,
      });

      if (dup.isDuplicate && !options?.overrideDuplicates) {
        result.duplicates++;
        continue;
      }

      let stage = "new";
      let isDuplicate = false;
      let duplicateOfId: string | undefined;

      if (dup.isDuplicate) {
        isDuplicate = true;
        duplicateOfId = dup.duplicateOfId;
        if (dup.autoAction === "mark_irrelevant") {
          stage = "irrelevant";
        }
      }

      const candidate = await prisma.candidate.create({
        data: {
          firstName: raw.firstName.trim(),
          lastName: raw.lastName.trim(),
          phone: normalizePhone(raw.phone),
          email: raw.email?.trim() || null,
          idNumber: raw.idNumber?.trim() || null,
          source: raw.source || "manual",
          sourceDetail: raw.sourceDetail || null,
          workerType: raw.workerType || null,
          city: raw.city || null,
          vehicleType: raw.vehicleType || null,
          positionId: raw.positionId || null,
          tags: raw.tags || [],
          formData: raw.formData || undefined,
          stage,
          isDuplicate,
          duplicateOfId: duplicateOfId || null,
          stageHistory: {
            create: {
              fromStage: "new",
              toStage: stage,
              changedById: userId,
              reason: isDuplicate ? "duplicate_import" : "import",
            },
          },
          activities: {
            create: {
              userId,
              type: isDuplicate ? "duplicate_detected" : "imported",
              description: isDuplicate
                ? "activity.duplicate_detected"
                : "activity.imported",
              metadata: dup.isDuplicate
                ? { matchType: dup.matchType, duplicateOfId: dup.duplicateOfId }
                : undefined,
            },
          },
        },
      });

      result.imported++;
      result.candidateIds.push(candidate.id);
    } catch {
      result.errors.push({ row: i + 1, message: "import_failed" });
    }
  }

  return result;
}
