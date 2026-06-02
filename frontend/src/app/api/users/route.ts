import { getServerSession, Session } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { Role } from "@prisma/client";

function requireAdmin(session: Session | null) {
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if ((session.user as any).role !== Role.admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  return null;
}

export async function GET() {
  const session = await getServerSession(authOptions);
  const deny = requireAdmin(session);
  if (deny) return deny;

  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      image: true,
      createdAt: true,
      _count: { select: { runs: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(users);
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const deny = requireAdmin(session);
  if (deny) return deny;

  const { id, role, isActive } = await req.json();

  if (!id) return NextResponse.json({ error: "User ID required" }, { status: 400 });

  // Prevent self-demotion
  if (id === session!.user.id && role && role !== Role.admin) {
    return NextResponse.json(
      { error: "You cannot change your own admin role" },
      { status: 400 }
    );
  }

  const validRoles = Object.values(Role) as string[];
  if (role && !validRoles.includes(role)) {
    return NextResponse.json({ error: "Invalid role" }, { status: 400 });
  }

  const updated = await prisma.user.update({
    where: { id },
    data: {
      ...(role !== undefined && { role }),
      ...(isActive !== undefined && { isActive }),
    },
    select: { id: true, name: true, email: true, role: true, isActive: true },
  });

  return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const deny = requireAdmin(session);
  if (deny) return deny;

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) return NextResponse.json({ error: "User ID required" }, { status: 400 });

  if (id === session!.user.id) {
    return NextResponse.json({ error: "Cannot delete your own account" }, { status: 400 });
  }

  await prisma.user.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
