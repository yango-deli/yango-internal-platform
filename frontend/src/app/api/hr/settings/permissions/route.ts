import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json(await prisma.hrFieldPermission.findMany());
}
export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if ((session.user as any).role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const updates: { fieldKey: string; role: string; canView: boolean; canEdit: boolean }[] = await req.json();
  await Promise.all(updates.map((u) => prisma.hrFieldPermission.upsert({ where: { fieldKey_role: { fieldKey: u.fieldKey, role: u.role } }, create: u, update: { canView: u.canView, canEdit: u.canEdit } })));
  return NextResponse.json(await prisma.hrFieldPermission.findMany());
}