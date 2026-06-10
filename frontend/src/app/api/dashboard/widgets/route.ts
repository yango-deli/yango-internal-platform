import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { WidgetKey, WidgetSize } from "@/types/dashboard";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;

  const configs = await prisma.userWidgetConfig.findMany({
    where: { userId },
    orderBy: { position: "asc" },
  });

  return NextResponse.json({ configs });
}
