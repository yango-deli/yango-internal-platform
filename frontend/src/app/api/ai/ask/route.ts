import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { query, mode } = await req.json();

  // In a real system we would:
  // - Load the appropriate AiProviderConfig based on mode (isSecure)
  // - Call the real API (OpenAI, Azure, internal proxy, Grok, etc.)
  // - Never expose keys to the client

  // Demo / placeholder response
  const reply = mode === "secure"
    ? `Secure AI (demo): Thanks for asking "${query}". In production this would call your internal secure model with no external data leakage.`
    : `External AI (demo): Here's a simulated response to "${query}". Configure real keys in Admin Settings.`;

  return NextResponse.json({ reply, mode });
}
