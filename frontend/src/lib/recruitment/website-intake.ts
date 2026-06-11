import { prisma } from "@/lib/prisma";
import type { RawCandidate } from "@/types/recruitment";

// Roles as defined by the recruitment website (src/types/role.ts there).
export const WEBSITE_ROLES = ["couriers", "pickers", "support", "manager"] as const;
export type WebsiteRole = (typeof WEBSITE_ROLES)[number];

export function isWebsiteRole(value: unknown): value is WebsiteRole {
  return typeof value === "string" && (WEBSITE_ROLES as readonly string[]).includes(value);
}

// Role -> CRM workerType (courier | store | office).
const ROLE_WORKER_TYPE: Record<WebsiteRole, string> = {
  couriers: "courier",
  pickers: "store",
  support: "office",
  manager: "store",
};

export interface WebsiteLeadPayload {
  role: WebsiteRole;
  firstName: string;
  lastName: string;
  phone: string;
  city?: string;
  vehicle?: string;
  taxRegistered?: "yes" | "no";
  locale?: string;
}

/**
 * Resolve the system user used as the author of automated website intake.
 * Upserts so the webhook works even if the DB was not (re)seeded.
 */
export async function resolveIntakeUserId(): Promise<string> {
  const user = await prisma.user.upsert({
    where: { email: "system@yango.local" },
    update: {},
    create: {
      email: "system@yango.local",
      name: "Website Intake",
      role: "admin",
      emailVerified: new Date(),
    },
    select: { id: true },
  });
  return user.id;
}

/**
 * Keep the WebsiteLead.status in sync with the linked Candidate.stage.
 * No-op for candidates that did not originate from a website lead.
 */
export async function syncWebsiteLeadStatus(
  candidateId: string,
  stage: string
): Promise<void> {
  await prisma.websiteLead.updateMany({
    where: { candidateId },
    data: { status: stage },
  });
}

/** Map a validated website lead payload to a CRM RawCandidate. */
export async function websiteLeadToRawCandidate(
  lead: WebsiteLeadPayload
): Promise<RawCandidate> {
  const position = await prisma.recruitmentPosition.findUnique({
    where: { slug: lead.role },
    select: { id: true },
  });

  return {
    firstName: lead.firstName,
    lastName: lead.lastName,
    phone: lead.phone,
    source: "website",
    sourceDetail: lead.role,
    workerType: ROLE_WORKER_TYPE[lead.role],
    city: lead.city,
    vehicleType: lead.vehicle,
    positionId: position?.id,
    tags: [lead.role],
    formData: {
      role: lead.role,
      locale: lead.locale,
      vehicle: lead.vehicle,
      taxRegistered: lead.taxRegistered,
    },
  };
}
