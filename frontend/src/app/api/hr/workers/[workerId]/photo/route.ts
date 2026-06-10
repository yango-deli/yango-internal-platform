import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { put } from "@vercel/blob";

export async function POST(req: NextRequest, { params }: { params: { workerId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const formData = await req.formData();
  const file = formData.get("file") as File;
  const blob = await put(`workers/${params.workerId}/photo/${file.name}`, file, { access: "public" });
  await prisma.worker.update({ where: { id: params.workerId }, data: { profileImage: blob.url } });
  return NextResponse.json({ url: blob.url });
}