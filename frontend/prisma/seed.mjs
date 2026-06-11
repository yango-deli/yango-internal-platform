import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const CITIES = ["Tel Aviv", "Haifa", "Jerusalem", "Be'er Sheva", "Netanya", "Rishon LeZion"];
const SOURCES = ["website", "facebook", "manual", "referral"];
const WORKER_TYPES = ["courier", "store", "office"];
const STAGES = [
  "new",
  "contacted",
  "screening",
  "interview_scheduled",
  "interview_done",
  "offer_sent",
  "hired",
  "rejected",
  "irrelevant",
  "on_hold",
];

const FIRST = ["Daniel", "Maya", "Yossi", "Noa", "Avi", "Tamar", "Eitan", "Shira", "Omer", "Lior", "Roni", "Gal", "Ido", "Hila", "Amit", "Dana"];
const LAST = ["Cohen", "Levi", "Mizrahi", "Peretz", "Biton", "Friedman", "Avraham", "Katz", "Shapiro", "Azoulay", "Gabbay", "Dahan"];

function pick(arr, i) {
  return arr[i % arr.length];
}

function phone(i) {
  const n = (500000000 + i * 137711).toString().slice(0, 9);
  return `05${n.slice(0, 1)}-${n.slice(1, 4)}-${n.slice(4, 8)}`;
}

async function main() {
  const admin = await prisma.user.upsert({
    where: { email: "admin@yango.local" },
    update: { role: "admin" },
    create: {
      email: "admin@yango.local",
      name: "Admin User",
      role: "admin",
      emailVerified: new Date(),
    },
  });

  const recruiter = await prisma.user.upsert({
    where: { email: "recruiter@yango.local" },
    update: { role: "manager" },
    create: {
      email: "recruiter@yango.local",
      name: "Rina Recruiter",
      role: "manager",
      emailVerified: new Date(),
    },
  });

  // System author for automated website lead intake.
  await prisma.user.upsert({
    where: { email: "system@yango.local" },
    update: { role: "admin", name: "Website Intake" },
    create: {
      email: "system@yango.local",
      name: "Website Intake",
      role: "admin",
      emailVerified: new Date(),
    },
  });

  const recruiters = [admin.id, recruiter.id];

  // Real positions, aligned with the recruitment website roles (slug = website role).
  const positionsData = [
    { slug: "couriers", title: "Couriers", department: "Operations" },
    { slug: "pickers", title: "Pickers", department: "Operations" },
    { slug: "support", title: "Customer Support", department: "Customer Service" },
    { slug: "manager", title: "Shift Manager", department: "Operations" },
  ];

  const positions = [];
  for (const p of positionsData) {
    const existing =
      (await prisma.recruitmentPosition.findUnique({ where: { slug: p.slug } })) ??
      (await prisma.recruitmentPosition.findFirst({ where: { title: p.title } }));
    positions.push(
      existing
        ? await prisma.recruitmentPosition.update({
            where: { id: existing.id },
            data: { ...p, isActive: true },
          })
        : await prisma.recruitmentPosition.create({ data: p })
    );
  }

  // Deactivate any legacy/demo positions that are not part of the real set.
  await prisma.recruitmentPosition.updateMany({
    where: { slug: { notIn: positionsData.map((p) => p.slug) } },
    data: { isActive: false },
  });

  // Clear previous demo candidates to keep seed idempotent.
  await prisma.candidate.deleteMany({
    where: { email: { endsWith: "@example.com" } },
  });

  const total = 24;
  for (let i = 0; i < total; i++) {
    const stage = pick(STAGES, i);
    const first = pick(FIRST, i);
    const last = pick(LAST, i + 3);
    const workerType = pick(WORKER_TYPES, i);
    const source = pick(SOURCES, i);
    const assignedToId = pick(recruiters, i);
    const daysAgo = (i % 20) + 1;
    const createdAt = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);

    const candidate = await prisma.candidate.create({
      data: {
        firstName: first,
        lastName: last,
        phone: phone(i),
        email: `${first.toLowerCase()}.${last.toLowerCase()}${i}@example.com`,
        source,
        sourceDetail: source === "referral" ? "Employee referral" : null,
        workerType,
        city: pick(CITIES, i),
        vehicleType: workerType === "courier" ? pick(["bike", "scooter", "car"], i) : null,
        positionId: pick(positions, i).id,
        stage,
        assignedToId,
        tags: i % 3 === 0 ? ["urgent"] : i % 4 === 0 ? ["fluent-hebrew"] : [],
        createdAt,
        updatedAt: createdAt,
        stageHistory: {
          create: {
            fromStage: "new",
            toStage: stage,
            changedById: assignedToId,
            reason: stage === "rejected" ? "Not a fit" : stage === "irrelevant" ? "Out of area" : null,
            createdAt,
          },
        },
        activities: {
          create: {
            userId: assignedToId,
            type: "created",
            description: "activity.created",
            createdAt,
          },
        },
        notes:
          i % 5 === 0
            ? {
                create: {
                  authorId: assignedToId,
                  content: "Strong candidate, schedule a call this week.",
                  isPinned: i % 10 === 0,
                },
              }
            : undefined,
      },
    });

    void candidate;
  }

  const count = await prisma.candidate.count();
  console.log(`Seed complete. Users: 3, Positions: ${positions.length}, Candidates: ${count}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
