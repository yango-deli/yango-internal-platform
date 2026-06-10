import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { DashboardLayout } from "@/types/dashboard";
import { getDefaultLayoutForRole } from "@/types/dashboard";
import { Role as PrismaRole } from "@prisma/client";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  const role = (session.user.role || "viewer") as PrismaRole;

  let layoutRecord = await prisma.userDashboardLayout.findUnique({
    where: { userId },
  });

  if (!layoutRecord) {
    // Seed default layout for role on first access
    const defaultLayout = getDefaultLayoutForRole(role);
    layoutRecord = await prisma.userDashboardLayout.create({
      data: {
        userId,
        layout: defaultLayout as any,
      },
    });
  }

  return NextResponse.json({ layout: layoutRecord.layout });
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  const body = await req.json().catch(() => ({}));
  const layout = body.layout as DashboardLayout;

  if (!layout || typeof layout !== "object") {
    return NextResponse.json({ error: "Invalid layout" }, { status: 400 });
  }

  const updated = await prisma.userDashboardLayout.upsert({
    where: { userId },
    update: { layout: layout as any },
    create: { userId, layout: layout as any },
  });

  return NextResponse.json({ layout: updated.layout });
}
