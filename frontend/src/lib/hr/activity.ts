import { prisma } from "@/lib/prisma";

interface LogOptions {
  workerId: string;
  userId: string;
  type: string;
  description: string;
  fieldName?: string;
  oldValue?: string;
  newValue?: string;
  metadata?: Record<string, unknown>;
}

export async function logWorkerActivity(opts: LogOptions) {
  await prisma.workerActivity.create({
    data: {
      workerId: opts.workerId,
      userId: opts.userId,
      type: opts.type,
      description: opts.description,
      fieldName: opts.fieldName,
      oldValue: opts.oldValue,
      newValue: opts.newValue,
      metadata: opts.metadata as any,
    },
  });
}