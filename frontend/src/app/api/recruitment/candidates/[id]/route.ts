import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { findDuplicate } from "@/lib/recruitment/duplicates";
import { normalizePhone } from "@/lib/recruitment/phone";
import {
  getRecruitmentSession,
  requireRecruitmentAccess,
  requireAdmin,
} from "@/lib/recruitment/auth";
import { candidateInclude } from "@/lib/recruitment/queries";
import { syncWebsiteLeadStatus } from "@/lib/recruitment/website-intake";
import { RECRUITMENT_STAGES, STAGES_REQUIRING_REASON } from "@/types/recruitment";

type Params = { params: { id: string } };

export async function GET(_req: NextRequest, { params }: Params) {
  const session = await getRecruitmentSession();
  const deny = requireRecruitmentAccess(session);
  if (deny) return deny;

  const candidate = await prisma.candidate.findUnique({
    where: { id: params.id },
    include: {
      ...candidateInclude,
      stageHistory: {
        include: { changedBy: { select: { id: true, name: true, image: true } } },
        orderBy: { createdAt: "desc" },
      },
      notes: {
        include: { author: { select: { id: true, name: true, image: true } } },
        orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
      },
      activities: {
        include: { user: { select: { id: true, name: true, image: true } } },
        orderBy: { createdAt: "desc" },
        take: 50,
      },
    },
  });

  if (!candidate) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(candidate);
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await getRecruitmentSession();
  const deny = requireRecruitmentAccess(session);
  if (deny) return deny;

  const body = await req.json();
  const existing = await prisma.candidate.findUnique({
    where: { id: params.id },
  });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { stage, reason, ...fields } = body;

  if (stage && stage !== existing.stage) {
    if (!RECRUITMENT_STAGES.includes(stage)) {
      return NextResponse.json({ error: "invalid stage" }, { status: 400 });
    }
    if (
      STAGES_REQUIRING_REASON.includes(stage) &&
      !reason?.trim()
    ) {
      return NextResponse.json({ error: "reason required" }, { status: 400 });
    }

    await prisma.$transaction([
      prisma.candidate.update({
        where: { id: params.id },
        data: { stage, ...sanitizeFields(fields) },
      }),
      prisma.candidateStageHistory.create({
        data: {
          candidateId: params.id,
          fromStage: existing.stage,
          toStage: stage,
          changedById: session!.user.id,
          reason: reason || null,
        },
      }),
      prisma.candidateActivity.create({
        data: {
          candidateId: params.id,
          userId: session!.user.id,
          type: "stage_changed",
          description: "activity.stage_changed",
          metadata: { from: existing.stage, to: stage },
        },
      }),
    ]);

    await syncWebsiteLeadStatus(params.id, stage);

    const updated = await prisma.candidate.findUnique({
      where: { id: params.id },
      include: candidateInclude,
    });
    return NextResponse.json(updated);
  }

  if (fields.phone || fields.email || fields.idNumber) {
    const dup = await findDuplicate(
      {
        phone: fields.phone ?? existing.phone,
        email: fields.email ?? existing.email,
        idNumber: fields.idNumber ?? existing.idNumber,
      },
      params.id
    );
    if (dup.isDuplicate && !body.overrideDuplicate) {
      return NextResponse.json(
        { error: "duplicate", duplicate: dup },
        { status: 409 }
      );
    }
  }

  const data = sanitizeFields(fields);
  if (data.phone) data.phone = normalizePhone(data.phone as string);

  const updated = await prisma.candidate.update({
    where: { id: params.id },
    data,
    include: candidateInclude,
  });

  await prisma.candidateActivity.create({
    data: {
      candidateId: params.id,
      userId: session!.user.id,
      type: "updated",
      description: "activity.updated",
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await getRecruitmentSession();
  const deny = requireAdmin(session);
  if (deny) return deny;

  await prisma.candidate.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}

function sanitizeFields(fields: Record<string, unknown>) {
  const allowed = [
    "firstName",
    "lastName",
    "phone",
    "email",
    "idNumber",
    "source",
    "sourceDetail",
    "workerType",
    "city",
    "vehicleType",
    "positionId",
    "assignedToId",
    "tags",
    "isArchived",
  ];
  const data: Record<string, unknown> = {};
  for (const key of allowed) {
    if (fields[key] !== undefined) data[key] = fields[key];
  }
  return data;
}
