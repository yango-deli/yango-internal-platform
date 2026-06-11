import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const [total, active, onLeave, terminated, byType] = await Promise.all([prisma.worker.count(), prisma.worker.count({ where: { status: "active" } }), prisma.worker.count({ where: { status: "on_leave" } }), prisma.worker.count({ where: { status: "terminated" } }), prisma.worker.groupBy({ by: ["workerType"], _count: true })]);
  return NextResponse.json({ total, active, onLeave, terminated, byType });
}