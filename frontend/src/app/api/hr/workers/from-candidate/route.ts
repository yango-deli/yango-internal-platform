import { NextRequest, NextResponse } from "next/server";
import {
  getRecruitmentSession,
  requireManagerOrAdmin,
} from "@/lib/recruitment/auth";

/** Stub: convert hired candidate to HR worker record (HR module not built yet). */
export async function POST(req: NextRequest) {
  const session = await getRecruitmentSession();
  const deny = requireManagerOrAdmin(session);
  if (deny) return deny;

  const { candidateId } = await req.json();
  if (!candidateId) {
    return NextResponse.json({ error: "candidateId required" }, { status: 400 });
  }

  return NextResponse.json({
    success: true,
    stub: true,
    message: "HR worker module not yet implemented",
    candidateId,
  });
}
