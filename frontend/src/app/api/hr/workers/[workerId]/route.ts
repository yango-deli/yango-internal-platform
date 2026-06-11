import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logWorkerActivity } from "@/lib/hr/activity";

const INCLUDE = {
  department: true, store: true,
  manager: { select: { id: true, firstName: true, lastName: true } },
  previousPositions: { orderBy: { order: "asc" as const } },
  equipment: { where: { status: "assigned" } },
  fundSubscriptions: true,
};

export async function GET(_req: NextRequest, { params }: { params: { workerId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const worker = await prisma.worker.findUnique({ where: { id: params.workerId }, include: INCLUDE });
  if (!worker) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(worker);
}

export async function PATCH(req: NextRequest, { params }: { params: { workerId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!["admin", "manager"].includes((session.user as any).role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const data = await req.json();
  const existing = await prisma.worker.findUnique({ where: { id: params.workerId } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const { previousPositions, equipment, fundSubscriptions, ...updateData } = data;
  const worker = await prisma.worker.update({ where: { id: params.workerId }, data: updateData, include: INCLUDE });
  const TRACKED = ["status", "firstName", "lastName", "phone", "positionTitle", "workerType", "employmentType", "departmentId", "storeId", "managerId"];
  for (const field of TRACKED) {
    const old = (existing as any)[field];
    const next = updateData[field];
    if (next !== undefined && old !== next) {
      await logWorkerActivity({ workerId: params.workerId, userId: session.user.id!, type: field === "status" ? "status_changed" : "field_updated", description: `${field}_changed`, fieldName: field, oldValue: String(old ?? ""), newValue: String(next ?? "") });
    }
  }
  return NextResponse.json(worker);
}

export async function DELETE(_req: NextRequest, { params }: { params: { workerId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if ((session.user as any).role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  await prisma.worker.delete({ where: { id: params.workerId } });
  return NextResponse.json({ success: true });
}