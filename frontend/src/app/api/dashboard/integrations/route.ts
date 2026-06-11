import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Microsoft is auto-connected via the Entra SSO login + accessToken
  const items = [
    { provider: "microsoft", connected: true, services: ["mail", "calendar", "planner", "onedrive"] },
  ];

  return NextResponse.json({ items });
}
