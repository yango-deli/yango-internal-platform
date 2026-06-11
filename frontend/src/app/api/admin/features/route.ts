import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== Role.admin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let cfg = await prisma.systemConfig.findUnique({ where: { key: "enabledWidgets" } });
  return NextResponse.json({ enabledWidgets: (cfg?.value as any)?.list || [] });
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== Role.admin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const list = Array.isArray(body.enabledWidgets) ? body.enabledWidgets : [];

  await prisma.systemConfig.upsert({
    where: { key: "enabledWidgets" },
    update: { value: { list } as any },
    create: { key: "enabledWidgets", value: { list } as any },
  });

  return NextResponse.json({ ok: true });
}
