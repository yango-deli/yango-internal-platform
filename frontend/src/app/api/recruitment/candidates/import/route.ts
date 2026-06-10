import { NextRequest, NextResponse } from "next/server";
import {
  getRecruitmentSession,
  requireRecruitmentAccess,
} from "@/lib/recruitment/auth";
import { processCandidates } from "@/lib/recruitment/import";
import type { RawCandidate } from "@/types/recruitment";

export async function POST(req: NextRequest) {
  const session = await getRecruitmentSession();
  const deny = requireRecruitmentAccess(session);
  if (deny) return deny;

  const { candidates, overrideDuplicates } = await req.json();

  if (!Array.isArray(candidates) || candidates.length === 0) {
    return NextResponse.json(
      { error: "candidates array required" },
      { status: 400 }
    );
  }

  const result = await processCandidates(
    candidates as RawCandidate[],
    session!.user.id,
    { overrideDuplicates: !!overrideDuplicates }
  );

  return NextResponse.json(result);
}
