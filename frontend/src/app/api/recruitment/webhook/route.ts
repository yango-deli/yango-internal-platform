import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { processCandidates } from "@/lib/recruitment/import";
import { normalizePhone } from "@/lib/recruitment/phone";
import {
  isWebsiteRole,
  resolveIntakeUserId,
  websiteLeadToRawCandidate,
  type WebsiteLeadPayload,
} from "@/lib/recruitment/website-intake";

// POST /api/recruitment/webhook
// Called by: recruitment website (/api/submit-lead forwards leads here)
// Setup: set RECRUITMENT_WEBHOOK_SECRET env var (must match the website's CRM_WEBHOOK_SECRET)
// Auth: validates the X-Webhook-Secret header (route is exempt from NextAuth middleware)
// Expected payload: { role, firstName, lastName, phone, city?, vehicle?, taxRegistered?, locale? }
// Returns: { imported, duplicates, errors }

export async function POST(req: NextRequest) {
  const secret = req.headers.get("X-Webhook-Secret");
  const expected = process.env.RECRUITMENT_WEBHOOK_SECRET;

  if (!expected || secret !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (typeof body !== "object" || body === null) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 422 });
  }

  const b = body as Record<string, unknown>;

  if (!isWebsiteRole(b.role)) {
    return NextResponse.json({ error: "Invalid role" }, { status: 422 });
  }

  const firstName = typeof b.firstName === "string" ? b.firstName.trim() : "";
  const lastName = typeof b.lastName === "string" ? b.lastName.trim() : "";
  const phone = typeof b.phone === "string" ? b.phone.trim() : "";

  if (!firstName || !lastName || !phone) {
    return NextResponse.json(
      { error: "Missing required fields", required: ["firstName", "lastName", "phone"] },
      { status: 422 }
    );
  }

  const lead: WebsiteLeadPayload = {
    role: b.role,
    firstName,
    lastName,
    phone,
    city: typeof b.city === "string" ? b.city : undefined,
    vehicle: typeof b.vehicle === "string" ? b.vehicle : undefined,
    taxRegistered: b.taxRegistered === "yes" || b.taxRegistered === "no" ? b.taxRegistered : undefined,
    locale: typeof b.locale === "string" ? b.locale : undefined,
  };

  try {
    const userId = await resolveIntakeUserId();
    const raw = await websiteLeadToRawCandidate(lead);
    const result = await processCandidates([raw], userId, { overrideDuplicates: false });

    // Record the raw submission in the dedicated leads table, linked to the
    // created candidate (if any). Status mirrors the candidate stage.
    const candidateId = result.candidateIds[0] ?? null;
    let status = "duplicate";
    if (candidateId) {
      const created = await prisma.candidate.findUnique({
        where: { id: candidateId },
        select: { stage: true },
      });
      status = created?.stage ?? "new";
    }

    await prisma.websiteLead.create({
      data: {
        role: lead.role,
        firstName: lead.firstName,
        lastName: lead.lastName,
        phone: normalizePhone(lead.phone),
        city: lead.city ?? null,
        vehicle: lead.vehicle ?? null,
        taxRegistered: lead.taxRegistered ?? null,
        locale: lead.locale ?? null,
        source: "website",
        status,
        candidateId,
        rawPayload: b,
      },
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("[recruitment/webhook] intake failed:", error);
    return NextResponse.json({ error: "Intake failed" }, { status: 500 });
  }
}
