import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";

async function canManage(userId: string, role: Role, announcementId: string) {
  if (role === "admin" || role === "manager") return true;
  // author can edit their own
  const ann = await prisma.companyAnnouncement.findUnique({ where: { id: announcementId } });
  return !!ann && ann.authorId === userId;
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;
  const role = session.user.role as Role;
  const { id } = params;

  const allowed = await canManage(userId, role, id);
  if (!allowed) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json().catch(() => ({}));
  const data: any = {};
  if (typeof body.title === "string") data.title = body.title.slice(0, 200);
  if (typeof body.body === "string") data.body = body.body;
  if (Array.isArray(body.targetRoles)) data.targetRoles = body.targetRoles;
  if (typeof body.isPinned === "boolean") data.isPinned = body.isPinned;
  if (body.expiresAt !== undefined) data.expiresAt = body.expiresAt ? new Date(body.expiresAt) : null;

  const updated = await prisma.companyAnnouncement.update({
    where: { id },
    data,
    include: { author: { select: { name: true, email: true } } },
  });

  return NextResponse.json({ announcement: updated });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;
  const role = session.user.role as Role;
  const { id } = params;

  const allowed = await canManage(userId, role, id);
  if (!allowed) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await prisma.companyAnnouncement.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
