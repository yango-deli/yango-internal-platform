import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logWorkerActivity } from "@/lib/hr/activity";
import * as XLSX from "xlsx";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") ?? "";
  const statuses = searchParams.getAll("status");
  const workerTypes = searchParams.getAll("workerType");
  const sortBy = searchParams.get("sortBy") ?? "firstName";
  const sortDir = (searchParams.get("sortDir") ?? "asc") as "asc" | "desc";
  const exportFormat = searchParams.get("export");
  const lang = searchParams.get("lang") ?? "en";

  const where: any = {};
  if (search) {
    where.OR = [
      { firstName: { contains: search, mode: "insensitive" } },
      { lastName: { contains: search, mode: "insensitive" } },
      { phone: { contains: search } },
      { idNumber: { contains: search } },
      { employeeNumber: { contains: search } },
    ];
  }
  if (statuses.length) where.status = { in: statuses };
  if (workerTypes.length) where.workerType = { in: workerTypes };

  const workers = await prisma.worker.findMany({
    where,
    include: { department: true, store: true, manager: { select: { id: true, firstName: true, lastName: true } } },
    orderBy: { [sortBy]: sortDir },
  });

  if (exportFormat === "excel") {
    const colMap: Record<string, Record<string, string>> = {
      he: { fn: "\u05e9\u05dd \u05e4\u05e8\u05d8\u05d9", ln: "\u05e9\u05dd \u05de\u05e9\u05e4\u05d7\u05d4", ph: "\u05d8\u05dc\u05e4\u05d5\u05df", id: "\u05ea.\u05d6.", en: "\u05de\u05e1\u05e4\u05e8 \u05e2\u05d5\u05d1\u05d3", st: "\u05e1\u05d8\u05d8\u05d5\u05e1", wt: "\u05e1\u05d5\u05d2 \u05e2\u05d5\u05d1\u05d3", pt: "\u05ea\u05e4\u05e7\u05d9\u05d3", dp: "\u05de\u05d7\u05dc\u05e7\u05d4", sd: "\u05ea\u05d0\u05e8\u05d9\u05da \u05d4\u05ea\u05d7\u05dc\u05d4" },
      ru: { fn: "\u0418\u043c\u044f", ln: "\u0424\u0430\u043c\u0438\u043b\u0438\u044f", ph: "\u0422\u0435\u043b\u0435\u0444\u043e\u043d", id: "ID", en: "\u0422\u0430\u0431\u0435\u043b\u044c\u043d\u044b\u0439", st: "\u0421\u0442\u0430\u0442\u0443\u0441", wt: "\u0422\u0438\u043f", pt: "\u0414\u043e\u043b\u0436\u043d\u043e\u0441\u0442\u044c", dp: "\u041e\u0442\u0434\u0435\u043b", sd: "\u0414\u0430\u0442\u0430 \u043d\u0430\u0447\u0430\u043b\u0430" },
      en: { fn: "First Name", ln: "Last Name", ph: "Phone", id: "ID Number", en: "Employee #", st: "Status", wt: "Type", pt: "Position", dp: "Department", sd: "Start Date" },
    };
    const c = colMap[lang] ?? colMap.en;
    const rows = workers.map((w) => ({ [c.fn]: w.firstName, [c.ln]: w.lastName, [c.ph]: w.phone, [c.id]: w.idNumber ?? "", [c.en]: w.employeeNumber ?? "", [c.st]: w.status, [c.wt]: w.workerType ?? "", [c.pt]: w.positionTitle ?? "", [c.dp]: w.department?.name ?? w.store?.name ?? "", [c.sd]: w.startDate ? w.startDate.toLocaleDateString() : "" }));
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(rows);
    XLSX.utils.book_append_sheet(wb, ws, "Workers");
    const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
    return new NextResponse(buf, { headers: { "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "Content-Disposition": `attachment; filename="workers_${Date.now()}.xlsx"` } });
  }

  return NextResponse.json(workers);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const role = (session.user as any).role;
  if (!["admin", "manager"].includes(role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const data = await req.json();
  const worker = await prisma.worker.create({ data: { ...data, createdById: session.user.id, status: data.status ?? "active" } });
  await logWorkerActivity({ workerId: worker.id, userId: session.user.id!, type: "worker_created", description: "worker_created" });
  return NextResponse.json(worker, { status: 201 });
}