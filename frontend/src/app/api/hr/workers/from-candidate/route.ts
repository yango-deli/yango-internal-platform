import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logWorkerActivity } from "@/lib/hr/activity";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!["admin", "manager"].includes((session.user as any).role))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { candidateId } = await req.json();
  const candidate = await prisma.candidate.findUnique({ where: { id: candidateId } });
  if (!candidate) return NextResponse.json({ error: "Candidate not found" }, { status: 404 });
  if (candidate.convertedWorkerId)
    return NextResponse.json({ error: "Already converted" }, { status: 409 });

  const worker = await prisma.worker.create({
    data: {
      firstName: candidate.firstName,
      lastName: candidate.lastName,
      phone: candidate.phone,
      email: candidate.email ?? undefined,
      idNumber: candidate.idNumber ?? undefined,
      city: candidate.city ?? undefined,
      workerType: candidate.workerType ?? undefined,
      vehicleType: candidate.vehicleType ?? undefined,
      leadSource: candidate.source,
      candidateId: candidate.id,
      status: "active",
      createdById: session.user.id,
    },
  });

  await prisma.candidate.update({ where: { id: candidateId }, data: { convertedWorkerId: worker.id, stage: "hired" } });
  await logWorkerActivity({ workerId: worker.id, userId: session.user.id!, type: "worker_created", description: "worker_created", metadata: { candidateId } });
  return NextResponse.json(worker, { status: 201 });
}