import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;
  const body = await req.json().catch(() => ({}));
  const order: string[] = body.order || []; // array of shortcut ids in new order

  if (!Array.isArray(order) || order.length === 0) {
    return NextResponse.json({ error: "order array required" }, { status: 400 });
  }

  // Verify all belong to user
  const count = await prisma.userShortcut.count({
    where: { userId, id: { in: order } },
  });
  if (count !== order.length) {
    return NextResponse.json({ error: "Invalid shortcut ids" }, { status: 400 });
  }

  // Update positions in transaction
  await prisma.$transaction(
    order.map((id, index) =>
      prisma.userShortcut.update({
        where: { id },
        data: { position: index },
      })
    )
  );

  return NextResponse.json({ ok: true });
}
