import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { Role } from "@prisma/client";

const ALLOWED_ROLES: Role[] = [Role.admin, Role.manager, Role.analyst];

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!ALLOWED_ROLES.includes(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const pythonApiUrl = process.env.PYTHON_API_URL;
  const internalSecret = process.env.PYTHON_INTERNAL_SECRET;

  if (!pythonApiUrl || !internalSecret) {
    return NextResponse.json(
      { error: "Server configuration error" },
      { status: 500 }
    );
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const file = formData.get("file") as File | null;
  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  // Forward to Python API
  const proxyForm = new FormData();
  proxyForm.append("file", file);

  // Forward all config fields
  for (const [key, value] of formData.entries()) {
    if (key !== "file") {
      proxyForm.append(key, value);
    }
  }

  let pythonResponse: Response;
  try {
    pythonResponse = await fetch(`${pythonApiUrl}/simulate`, {
      method: "POST",
      headers: {
        "X-Internal-Secret": internalSecret,
      },
      body: proxyForm,
    });
  } catch (err) {
    console.error("Python API unreachable:", err);
    return NextResponse.json(
      { error: "Processing service unavailable" },
      { status: 503 }
    );
  }

  if (!pythonResponse.ok) {
    const errorBody = await pythonResponse.json().catch(() => ({}));
    return NextResponse.json(
      { error: errorBody.detail ?? "Processing failed" },
      { status: pythonResponse.status }
    );
  }

  const result = await pythonResponse.json();

  // Persist the run
  const run = await prisma.simulationRun.create({
    data: {
      userId: session.user.id,
      fileName: file.name,
      config: JSON.parse(formData.get("config") as string ?? "{}"),
      summary: {
        tierResults: result.tierResults,
        brandSummary: result.brandSummary,
        dateRangeUsed: result.dateRangeUsed,
        totalOrdersAnalyzed: result.totalOrdersAnalyzed,
      },
    },
  });

  return NextResponse.json({ ...result, runId: run.id });
}
