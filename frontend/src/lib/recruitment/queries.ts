import { Prisma } from "@prisma/client";
import type { CandidateFilters } from "@/types/recruitment";

export const candidateInclude = {
  position: { select: { id: true, title: true } },
  assignedTo: { select: { id: true, name: true, image: true, email: true } },
  _count: { select: { notes: true, activities: true } },
} satisfies Prisma.CandidateInclude;

export function buildCandidateWhere(
  filters: CandidateFilters
): Prisma.CandidateWhereInput {
  const where: Prisma.CandidateWhereInput = { isArchived: false };

  if (filters.source) where.source = filters.source;
  if (filters.workerType) where.workerType = filters.workerType;
  if (filters.assignedToId) where.assignedToId = filters.assignedToId;
  if (filters.tags?.length) where.tags = { hasSome: filters.tags };

  if (filters.dateFrom || filters.dateTo) {
    where.createdAt = {};
    if (filters.dateFrom) where.createdAt.gte = new Date(filters.dateFrom);
    if (filters.dateTo) {
      const end = new Date(filters.dateTo);
      end.setHours(23, 59, 59, 999);
      where.createdAt.lte = end;
    }
  }

  if (filters.search) {
    const q = filters.search.trim();
    where.OR = [
      { firstName: { contains: q, mode: "insensitive" } },
      { lastName: { contains: q, mode: "insensitive" } },
      { phone: { contains: q } },
      { email: { contains: q, mode: "insensitive" } },
    ];
  }

  return where;
}
