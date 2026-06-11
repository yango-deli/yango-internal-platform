import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Role } from "@prisma/client";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== Role.admin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // In real app this would come from AiProviderConfig table
  return NextResponse.json({
    providers: [
      { provider: "internal-secure-proxy", isSecure: true, isEnabled: true },
      { provider: "grok", isSecure: false, isEnabled: false },
    ],
  });
}
