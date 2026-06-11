import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Upsert a Microsoft integration record (real sync would refresh Graph data)
  await prisma.userIntegration.upsert({
    where: { id: "ms-" + session.user.id }, // simplistic
    update: { lastSyncedAt: new Date(), metadata: { services: ["mail", "planner", "calendar"] } as any },
    create: {
      id: "ms-" + session.user.id,
      userId: session.user.id,
      provider: "microsoft",
      connected: true,
      metadata: { services: ["mail", "planner", "calendar"] } as any,
      lastSyncedAt: new Date(),
    },
  });

  return NextResponse.json({ ok: true });
}
