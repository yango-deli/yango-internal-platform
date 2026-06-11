import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logWorkerActivity } from "@/lib/hr/activity";
import { put } from "@vercel/blob";

export async function GET(_req: NextRequest, { params }: { params: { workerId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const docs = await prisma.workerDocument.findMany({ where: { workerId: params.workerId }, include: { uploadedBy: { select: { name: true } } }, orderBy: [{ type: "asc" }, { version: "desc" }] });
  return NextResponse.json(docs);
}

export async function POST(req: NextRequest, { params }: { params: { workerId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const formData = await req.formData();
  const file = formData.get("file") as File;
  const type = formData.get("type") as string;
  const title = formData.get("title") as string;
  const replacesId = formData.get("replacesId") as string | null;
  let version = 1;
  if (replacesId) { const old = await prisma.workerDocument.findUnique({ where: { id: replacesId } }); if (old) { await prisma.workerDocument.update({ where: { id: replacesId }, data: { isLatest: false } }); version = (old.version ?? 1) + 1; } }
  const blob = await put(`workers/${params.workerId}/${type}/${file.name}`, file, { access: "public" });
  const doc = await prisma.workerDocument.create({ data: { workerId: params.workerId, type, title, fileName: file.name, fileUrl: blob.url, fileSize: file.size, mimeType: file.type, version, isLatest: true, uploadedById: session.user.id }, include: { uploadedBy: { select: { name: true } } } });
  await logWorkerActivity({ workerId: params.workerId, userId: session.user.id!, type: replacesId ? "document_replaced" : "document_uploaded", description: replacesId ? `document_replaced:${title}:${version}` : `document_uploaded:${title}`, metadata: { documentId: doc.id, type, version } });
  return NextResponse.json(doc, { status: 201 });
}