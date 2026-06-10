import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  getRecruitmentSession,
  requireRecruitmentAccess,
} from "@/lib/recruitment/auth";

type Params = { params: { id: string; nid: string } };

export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await getRecruitmentSession();
  const deny = requireRecruitmentAccess(session);
  if (deny) return deny;

  const { content, isPinned } = await req.json();
  const note = await prisma.candidateNote.findUnique({
    where: { id: params.nid },
  });

  if (!note || note.candidateId !== params.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const updated = await prisma.candidateNote.update({
    where: { id: params.nid },
    data: {
      ...(content !== undefined && { content: content.trim() }),
      ...(isPinned !== undefined && { isPinned }),
    },
    include: {
      author: { select: { id: true, name: true, image: true } },
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await getRecruitmentSession();
  const deny = requireRecruitmentAccess(session);
  if (deny) return deny;

  const note = await prisma.candidateNote.findUnique({
    where: { id: params.nid },
  });

  if (!note || note.candidateId !== params.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.candidateNote.delete({ where: { id: params.nid } });
  return NextResponse.json({ success: true });
}
