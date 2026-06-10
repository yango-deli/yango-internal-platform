import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  getRecruitmentSession,
  requireRecruitmentAccess,
} from "@/lib/recruitment/auth";
import { RECRUITMENT_STAGES } from "@/types/recruitment";

export async function GET() {
  const session = await getRecruitmentSession();
  const deny = requireRecruitmentAccess(session);
  if (deny) return deny;

  const [byStage, bySource, recruiters] = await Promise.all([
    prisma.candidate.groupBy({
      by: ["stage"],
      where: { isArchived: false },
      _count: { id: true },
    }),
    prisma.candidate.groupBy({
      by: ["source"],
      where: { isArchived: false },
      _count: { id: true },
    }),
    prisma.candidate.groupBy({
      by: ["assignedToId", "stage"],
      where: { isArchived: false, assignedToId: { not: null } },
      _count: { id: true },
    }),
  ]);

  const funnel = RECRUITMENT_STAGES.map((stage) => ({
    stage,
    count: byStage.find((s) => s.stage === stage)?._count.id ?? 0,
  }));

  const hiredBySource = await prisma.candidate.groupBy({
    by: ["source"],
    where: { isArchived: false, stage: "hired" },
    _count: { id: true },
  });

  const conversion = bySource.map((s) => {
    const hired =
      hiredBySource.find((h) => h.source === s.source)?._count.id ?? 0;
    const total = s._count.id;
    return {
      source: s.source,
      total,
      hired,
      conversionRate: total > 0 ? Math.round((hired / total) * 100) : 0,
    };
  });

  const recruiterIds = [
    ...new Set(recruiters.map((r) => r.assignedToId).filter(Boolean)),
  ] as string[];

  const recruiterUsers = await prisma.user.findMany({
    where: { id: { in: recruiterIds } },
    select: { id: true, name: true, email: true },
  });

  const recruiterPerformance = recruiterUsers.map((user) => {
    const userGroups = recruiters.filter((r) => r.assignedToId === user.id);
    const total = userGroups.reduce((sum, g) => sum + g._count.id, 0);
    const hired =
      userGroups.find((g) => g.stage === "hired")?._count.id ?? 0;
    return {
      recruiter: user,
      total,
      hired,
      conversionRate: total > 0 ? Math.round((hired / total) * 100) : 0,
    };
  });

  const eightWeeksAgo = new Date();
  eightWeeksAgo.setDate(eightWeeksAgo.getDate() - 56);

  const recentCandidates = await prisma.candidate.findMany({
    where: { isArchived: false, createdAt: { gte: eightWeeksAgo } },
    select: { source: true, createdAt: true },
  });

  const leadsByWeek: Record<string, Record<string, number>> = {};
  for (const c of recentCandidates) {
    const weekStart = getWeekStart(c.createdAt);
    const key = weekStart.toISOString().slice(0, 10);
    if (!leadsByWeek[key]) leadsByWeek[key] = {};
    leadsByWeek[key][c.source] = (leadsByWeek[key][c.source] ?? 0) + 1;
  }

  return NextResponse.json({
    funnel,
    sourceStats: conversion,
    recruiterPerformance,
    leadsByWeek: Object.entries(leadsByWeek)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([week, sources]) => ({ week, sources })),
  });
}

function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  d.setDate(d.getDate() - day);
  d.setHours(0, 0, 0, 0);
  return d;
}
