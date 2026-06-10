import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { WidgetKey, WidgetSize } from "@/types/dashboard";

export async function PATCH(req: NextRequest, { params }: { params: { key: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;
  const widgetKey = params.key as WidgetKey;

  const body = await req.json().catch(() => ({}));

  const data: any = {};
  if (typeof body.position === "number") data.position = body.position;
  if (body.size && ["small", "medium", "large", "full"].includes(body.size)) {
    data.size = body.size as WidgetSize;
  }
  if (body.config !== undefined) data.config = body.config ?? null;
  if (typeof body.isVisible === "boolean") data.isVisible = body.isVisible;

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "No valid fields" }, { status: 400 });
  }

  const updated = await prisma.userWidgetConfig.upsert({
    where: { userId_widgetKey: { userId, widgetKey } },
    update: data,
    create: {
      userId,
      widgetKey,
      position: data.position ?? 0,
      size: data.size ?? "medium",
      config: data.config ?? null,
      isVisible: data.isVisible ?? true,
    },
  });

  return NextResponse.json({ config: updated });
}
