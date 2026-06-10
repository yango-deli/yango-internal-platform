import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  getRecruitmentSession,
  requireRecruitmentAccess,
} from "@/lib/recruitment/auth";

type Params = { params: { id: string } };

export async function POST(req: NextRequest, { params }: Params) {
  const session = await getRecruitmentSession();
  const deny = requireRecruitmentAccess(session);
  if (deny) return deny;

  const { content } = await req.json();
  if (!content?.trim()) {
    return NextResponse.json({ error: "content required" }, { status: 400 });
  }

  const note = await prisma.$transaction(async (tx) => {
    const created = await tx.candidateNote.create({
      data: {
        candidateId: params.id,
        authorId: session!.user.id,
        content: content.trim(),
      },
      include: {
        author: { select: { id: true, name: true, image: true } },
      },
    });

    await tx.candidateActivity.create({
      data: {
        candidateId: params.id,
        userId: session!.user.id,
        type: "note_added",
        description: "activity.note_added",
      },
    });

    return created;
  });

  return NextResponse.json(note, { status: 201 });
}
