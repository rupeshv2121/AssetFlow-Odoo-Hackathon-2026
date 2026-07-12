import { Request, Response } from "express";
import { Prisma } from "@prisma/client";
import { prisma } from "@/config/prisma";
import { asyncHandler } from "@/utils/asyncHandler";
import { AppError } from "@/utils/AppError";

const notificationSelect = {
  id: true,
  userId: true,
  type: true,
  message: true,
  isRead: true,
  relatedEntityType: true,
  relatedEntityId: true,
  createdAt: true,
} satisfies Prisma.NotificationSelect;

const activityLogSelect = {
  id: true,
  action: true,
  entityType: true,
  entityId: true,
  metadata: true,
  createdAt: true,
  user: {
    select: {
      id: true,
      name: true,
      role: true,
      department: { select: { id: true, name: true } },
    },
  },
} satisfies Prisma.ActivityLogSelect;

async function resolveAuditScope(req: Request): Promise<Prisma.ActivityLogWhereInput> {
  const { role, id } = req.user!;
  if (role === "ADMIN" || role === "ASSET_MANAGER") return {};

  if (role === "DEPARTMENT_HEAD") {
    const headedDepartments = await prisma.department.findMany({ where: { headId: id }, select: { id: true } });
    const departmentIds = headedDepartments.map((department) => department.id);
    if (departmentIds.length === 0) return { userId: id };

    return {
      OR: [
        { userId: id },
        { user: { departmentId: { in: departmentIds } } },
      ],
    };
  }

  return { userId: id };
}

export const getActivityCenter = asyncHandler(async (req: Request, res: Response) => {
  const [notifications, auditLogs, unreadNotificationCount] = await Promise.all([
    prisma.notification.findMany({
      where: { userId: req.user!.id },
      select: notificationSelect,
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    prisma.activityLog.findMany({
      where: await resolveAuditScope(req),
      select: activityLogSelect,
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
    prisma.notification.count({ where: { userId: req.user!.id, isRead: false } }),
  ]);

  res.json({
    scope: req.user!.role === "EMPLOYEE" ? "personal" : req.user!.role === "DEPARTMENT_HEAD" ? "department" : "organization",
    notifications,
    auditLogs,
    unreadNotificationCount,
  });
});

export const markNotificationRead = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const notification = await prisma.notification.findFirst({ where: { id, userId: req.user!.id }, select: { id: true } });
  if (!notification) throw new AppError(404, "Notification not found");

  const updated = await prisma.notification.update({
    where: { id },
    data: { isRead: true },
    select: notificationSelect,
  });

  res.json({ notification: updated });
});

export const markAllNotificationsRead = asyncHandler(async (req: Request, res: Response) => {
  await prisma.notification.updateMany({ where: { userId: req.user!.id, isRead: false }, data: { isRead: true } });
  res.json({ ok: true });
});