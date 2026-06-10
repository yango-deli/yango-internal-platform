import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;
  const role = (session.user.role || "viewer") as Role;

  const now = new Date();

  const announcements = await prisma.companyAnnouncement.findMany({
    where: {
      OR: [
        { targetRoles: { isEmpty: true } },
        { targetRoles: { has: role } },
      ],
      OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
    },
    orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
    include: {
      author: { select: { name: true, email: true } },
    },
    take: 50,
  });

  return NextResponse.json({ announcements });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;
  const role = session.user.role as Role;

  // Only admin/manager can post (as per typical internal policy)
  if (role !== "admin" && role !== "manager") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const { title, body: content, targetRoles = [], isPinned = false, expiresAt } = body;

  if (!title || !content) {
    return NextResponse.json({ error: "title and body required" }, { status: 400 });
  }

  const created = await prisma.companyAnnouncement.create({
    data: {
      title: String(title).slice(0, 200),
      body: String(content),
      authorId: userId,
      targetRoles: Array.isArray(targetRoles) ? targetRoles : [],
      isPinned: !!isPinned,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
    },
    include: { author: { select: { name: true, email: true } } },
  });

  return NextResponse.json({ announcement: created });
}
