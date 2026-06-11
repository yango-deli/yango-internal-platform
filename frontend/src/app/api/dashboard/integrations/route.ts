import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Microsoft is auto-connected via the Entra SSO login + accessToken (no extra OAuth).
  // Services are auto-detected / synced (Mail, Calendar, Planner, OneDrive, Teams, Directory search).
  const items = [
    {
      provider: "microsoft",
      connected: true,
      services: ["mail", "calendar", "planner", "onedrive", "teams", "directory"],
    },
  ];

  return NextResponse.json({ items });
}
