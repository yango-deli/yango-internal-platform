import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  getRecruitmentSession,
  requireRecruitmentAccess,
} from "@/lib/recruitment/auth";

export async function GET() {
  const session = await getRecruitmentSession();
  const deny = requireRecruitmentAccess(session);
  if (deny) return deny;

  const positions = await prisma.recruitmentPosition.findMany({
    where: { isActive: true },
    orderBy: { title: "asc" },
  });

  return NextResponse.json(positions);
}

export async function POST(req: NextRequest) {
  const session = await getRecruitmentSession();
  const deny = requireRecruitmentAccess(session);
  if (deny) return deny;

  const { title, department, description } = await req.json();
  if (!title?.trim()) {
    return NextResponse.json({ error: "title required" }, { status: 400 });
  }

  const position = await prisma.recruitmentPosition.create({
    data: {
      title: title.trim(),
      department: department?.trim() || null,
      description: description?.trim() || null,
    },
  });

  return NextResponse.json(position, { status: 201 });
}
