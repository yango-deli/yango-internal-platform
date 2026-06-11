import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { findDuplicate } from "@/lib/recruitment/duplicates";
import { normalizePhone } from "@/lib/recruitment/phone";
import {
  getRecruitmentSession,
  requireRecruitmentAccess,
} from "@/lib/recruitment/auth";
import {
  buildCandidateWhere,
  candidateInclude,
} from "@/lib/recruitment/queries";
import { RECRUITMENT_STAGES } from "@/types/recruitment";

export async function GET(req: NextRequest) {
  const session = await getRecruitmentSession();
  const deny = requireRecruitmentAccess(session);
  if (deny) return deny;

  const { searchParams } = new URL(req.url);
  const filters = {
    source: searchParams.get("source") || undefined,
    workerType: searchParams.get("workerType") || undefined,
    assignedToId: searchParams.get("assignedToId") || undefined,
    dateFrom: searchParams.get("dateFrom") || undefined,
    dateTo: searchParams.get("dateTo") || undefined,
    search: searchParams.get("search") || undefined,
    tags: searchParams.get("tags")?.split(",").filter(Boolean),
  };

  const candidates = await prisma.candidate.findMany({
    where: buildCandidateWhere(filters),
    include: candidateInclude,
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json(candidates);
}

export async function POST(req: NextRequest) {
  const session = await getRecruitmentSession();
  const deny = requireRecruitmentAccess(session);
  if (deny) return deny;

  const body = await req.json();
  const {
    firstName,
    lastName,
    phone,
    email,
    idNumber,
    source,
    sourceDetail,
    workerType,
    city,
    vehicleType,
    positionId,
    tags,
    assignedToId,
    overrideDuplicate,
  } = body;

  if (!firstName?.trim() || !lastName?.trim() || !phone?.trim()) {
    return NextResponse.json(
      { error: "missing_required_fields" },
      { status: 400 }
    );
  }

  const dup = await findDuplicate({ phone, email, idNumber });
  if (dup.isDuplicate && !overrideDuplicate) {
    return NextResponse.json(
      { error: "duplicate", duplicate: dup },
      { status: 409 }
    );
  }

  let stage = "new";
  let isDuplicate = false;
  let duplicateOfId: string | null = null;

  if (dup.isDuplicate) {
    isDuplicate = true;
    duplicateOfId = dup.duplicateOfId ?? null;
    if (dup.autoAction === "mark_irrelevant") stage = "irrelevant";
  }

  const candidate = await prisma.candidate.create({
    data: {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      phone: normalizePhone(phone),
      email: email?.trim() || null,
      idNumber: idNumber?.trim() || null,
      source: source || "manual",
      sourceDetail: sourceDetail || null,
      workerType: workerType || null,
      city: city || null,
      vehicleType: vehicleType || null,
      positionId: positionId || null,
      assignedToId: assignedToId || null,
      tags: tags || [],
      stage,
      isDuplicate,
      duplicateOfId,
      stageHistory: {
        create: {
          fromStage: "new",
          toStage: stage,
          changedById: session!.user.id,
          reason: isDuplicate ? "duplicate_create" : null,
        },
      },
      activities: {
        create: {
          userId: session!.user.id,
          type: "created",
          description: "activity.created",
        },
      },
    },
    include: candidateInclude,
  });

  return NextResponse.json(candidate, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const session = await getRecruitmentSession();
  const deny = requireRecruitmentAccess(session);
  if (deny) return deny;

  const { ids, stage, assignedToId, isArchived } = await req.json();
  if (!ids?.length) {
    return NextResponse.json({ error: "ids required" }, { status: 400 });
  }

  if (stage && !RECRUITMENT_STAGES.includes(stage)) {
    return NextResponse.json({ error: "invalid stage" }, { status: 400 });
  }

  const updates = await prisma.$transaction(
    ids.map((id: string) =>
      prisma.candidate.update({
        where: { id },
        data: {
          ...(stage !== undefined && { stage }),
          ...(assignedToId !== undefined && { assignedToId }),
          ...(isArchived !== undefined && { isArchived }),
        },
      })
    )
  );

  if (stage !== undefined) {
    await prisma.websiteLead.updateMany({
      where: { candidateId: { in: ids } },
      data: { status: stage },
    });
  }

  return NextResponse.json({ updated: updates.length });
}
