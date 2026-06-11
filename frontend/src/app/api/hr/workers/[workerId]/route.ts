import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logWorkerActivity } from "@/lib/hr/activity";

// Matches actual Prisma schema — no manager/previousPositions relations on Worker
const INCLUDE = {
  department:    true,
  store:         true,
  careerHistory: { orderBy: { startDate: "desc" as const } },
  equipment:     { where: { status: "assigned", deletedAt: null } },
  documents:     { where: { deletedAt: null }, orderBy: { createdAt: "desc" as const } },
};

type Params = { params: { workerId: string } };

export async function GET(_req: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const worker = await prisma.worker.findUnique({
    where: { id: params.workerId, deletedAt: null },
    include: INCLUDE,
  });
  if (!worker) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(worker);
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!["admin", "manager"].includes((session.user as { role?: string }).role ?? ""))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const data = await req.json();
  const existing = await prisma.worker.findUnique({ where: { id: params.workerId, deletedAt: null } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Strip relation objects, only keep scalar / FK fields
  const { careerHistory: _ch, equipment: _eq, documents: _docs, department: _dep, store: _st, ...updateData } = data;

  const worker = await prisma.worker.update({
    where: { id: params.workerId },
    data: updateData,
    include: INCLUDE,
  });

  const TRACKED = ["status", "firstName", "lastName", "phone", "positionTitle", "workerType", "employmentType", "departmentId", "storeId"];
  for (const field of TRACKED) {
    const old  = (existing as Record<string, unknown>)[field];
    const next = updateData[field];
    if (next !== undefined && old !== next) {
      await logWorkerActivity({
        workerId:    params.workerId,
        userId:      session.user.id!,
        type:        field === "status" ? "status_changed" : "field_updated",
        description: `${field === "status" ? "status_changed" : "field_updated"}:${field}`,
        fieldName:   field,
        oldValue:    String(old ?? ""),
        newValue:    String(next ?? ""),
      });
    }
  }

  return NextResponse.json(worker);
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if ((session.user as { role?: string }).role !== "admin")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  // Soft delete — preserves data for audit/compliance
  const worker = await prisma.worker.update({
    where: { id: params.workerId },
    data: { deletedAt: new Date() },
  });

  await logWorkerActivity({
    workerId:    params.workerId,
    userId:      session.user.id!,
    type:        "worker_deleted",
    description: "worker_deleted",
  });

  return NextResponse.json({ success: true, deletedAt: worker.deletedAt });
}
