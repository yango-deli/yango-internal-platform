import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;

  const shortcuts = await prisma.userShortcut.findMany({
    where: { userId, isVisible: true },
    orderBy: { position: "asc" },
  });

  return NextResponse.json({ shortcuts });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;
  const body = await req.json();

  const { title, url, icon, color, openInNewTab = false } = body;
  if (!title || !url) {
    return NextResponse.json({ error: "title and url required" }, { status: 400 });
  }

  // Append at end
  const maxPos = await prisma.userShortcut.aggregate({
    where: { userId },
    _max: { position: true },
  });
  const position = (maxPos._max.position ?? -1) + 1;

  const created = await prisma.userShortcut.create({
    data: {
      userId,
      title: String(title).slice(0, 120),
      url: String(url),
      icon: icon ? String(icon).slice(0, 8) : null,
      color: color ? String(color) : null,
      openInNewTab: !!openInNewTab,
      position,
    },
  });

  return NextResponse.json({ shortcut: created });
}
