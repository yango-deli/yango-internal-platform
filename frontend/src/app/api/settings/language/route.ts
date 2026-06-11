import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const SUPPORTED = ["he", "en", "ru"];

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { language } = await req.json();
  if (!SUPPORTED.includes(language)) {
    return NextResponse.json({ error: "invalid language" }, { status: 400 });
  }

  await prisma.userSettings.upsert({
    where: { userId: session.user.id },
    update: { language },
    create: { userId: session.user.id, language },
  });

  return NextResponse.json({ language });
}
