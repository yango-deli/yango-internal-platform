import { NextRequest, NextResponse } from "next/server";

// POST /api/recruitment/webhook
// Called by: courier website (yangodeli-couriers-carriers-website-4nzodsb4j.vercel.app)
// Called by: Facebook Lead Ads webhook
// Setup: set RECRUITMENT_WEBHOOK_SECRET env var
// Configure webhook URL: https://[your-domain]/api/recruitment/webhook
// Expected payload: { firstName, lastName, phone, email?, city?, workerType?, vehicleType?, source, sourceDetail? }
// Validates X-Webhook-Secret header, calls processCandidates(), returns { imported, duplicates, errors }

export async function POST(req: NextRequest) {
  const secret = req.headers.get("X-Webhook-Secret");
  const expected = process.env.RECRUITMENT_WEBHOOK_SECRET;

  if (!expected || secret !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Scaffold: full implementation will parse payload and call processCandidates()
  return NextResponse.json(
    {
      imported: 0,
      duplicates: 0,
      errors: [{ row: 0, message: "webhook_not_implemented" }],
    },
    { status: 501 }
  );
}
