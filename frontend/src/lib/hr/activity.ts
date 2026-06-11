import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

interface LogParams {
  workerId: string;
  userId: string;
  type: string;
  description: string;
  fieldName?: string;
  oldValue?: string;
  newValue?: string;
  metadata?: Record<string, unknown>;
}

export async function logWorkerActivity(params: LogParams) {
  try {
    await prisma.workerActivity.create({
      data: {
        workerId:    params.workerId,
        userId:      params.userId,
        type:        params.type,
        description: params.description,
        fieldName:   params.fieldName ?? null,
        oldValue:    params.oldValue  ?? null,
        newValue:    params.newValue  ?? null,
        metadata:    params.metadata !== undefined
          ? (params.metadata as unknown as Prisma.InputJsonValue)
          : Prisma.JsonNull,
      },
    });
  } catch (err) {
    console.error("[activity] Failed to log worker activity:", err);
  }
}
