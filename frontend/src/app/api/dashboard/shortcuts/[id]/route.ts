import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function ensureOwnership(userId: string, id: string) {
  const item = await prisma.userShortcut.findUnique({ where: { id } });
  if (!item || item.userId !== userId) {
    return null;
  }
  return item;
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;
  const { id } = params;

  const owned = await ensureOwnership(userId, id);
  if (!owned) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json().catch(() => ({}));

  const data: any = {};
  if (typeof body.title === "string") data.title = body.title.slice(0, 120);
  if (typeof body.url === "string") data.url = body.url;
  if (body.icon !== undefined) data.icon = body.icon ? String(body.icon).slice(0, 8) : null;
  if (body.color !== undefined) data.color = body.color ? String(body.color) : null;
  if (typeof body.openInNewTab === "boolean") data.openInNewTab = body.openInNewTab;

  const updated = await prisma.userShortcut.update({
    where: { id },
    data,
  });

  return NextResponse.json({ shortcut: updated });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;
  const { id } = params;

  const owned = await ensureOwnership(userId, id);
  if (!owned) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.userShortcut.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
