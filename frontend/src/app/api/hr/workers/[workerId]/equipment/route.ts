import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logWorkerActivity } from "@/lib/hr/activity";

export async function GET(_req: NextRequest, { params }: { params: { workerId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const eq = await prisma.workerEquipment.findMany({ where: { workerId: params.workerId }, orderBy: { createdAt: "desc" } });
  return NextResponse.json(eq);
}

export async function POST(req: NextRequest, { params }: { params: { workerId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const data = await req.json();
  const eq = await prisma.workerEquipment.create({ data: { ...data, workerId: params.workerId } });
  await logWorkerActivity({
    workerId: params.workerId,
    userId: session.user.id!,
    type: "equipment_assigned",
    description: `equipment_assigned:${data.name}`,
    metadata: { equipmentId: eq.id },
  });
  return NextResponse.json(eq, { status: 201 });
}