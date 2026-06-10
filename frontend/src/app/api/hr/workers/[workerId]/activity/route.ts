import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest, { params }: { params: { workerId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") ?? "1");
  const perPage = 20;
  const typeFilter = searchParams.get("type");

  const where: any = { workerId: params.workerId };
  if (typeFilter) where.type = typeFilter;

  const [total, activities] = await Promise.all([
    prisma.workerActivity.count({ where }),
    prisma.workerActivity.findMany({
      where,
      include: { user: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * perPage,
      take: perPage,
    }),
  ]);

  return NextResponse.json({ activities, page, pages: Math.ceil(total / perPage), total });
}