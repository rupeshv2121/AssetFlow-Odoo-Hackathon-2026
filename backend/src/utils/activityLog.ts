import { NotificationType, Prisma } from "@prisma/client";
import { prisma } from "@/config/prisma";

// Fire-and-forget, best-effort: called after the primary mutation has
// already succeeded, so a logging failure never rolls back real work. Errors
// are swallowed (not surfaced to the caller) — an audit trail gap is
// preferable to breaking the action that triggered it.
export async function logActivity(params: {
  userId: string;
  action: string;
  entityType: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
}) {
  try {
    await prisma.activityLog.create({
      data: {
        userId: params.userId,
        action: params.action,
        entityType: params.entityType,
        entityId: params.entityId,
        metadata: params.metadata as Prisma.InputJsonValue | undefined,
      },
    });
  } catch (err) {
    console.error("Failed to write activity log:", err);
  }
}

export async function notify(params: {
  userId: string;
  type: NotificationType;
  message: string;
  relatedEntityType?: string;
  relatedEntityId?: string;
}) {
  try {
    await prisma.notification.create({
      data: {
        userId: params.userId,
        type: params.type,
        message: params.message,
        relatedEntityType: params.relatedEntityType,
        relatedEntityId: params.relatedEntityId,
      },
    });
  } catch (err) {
    console.error("Failed to write notification:", err);
  }
}
