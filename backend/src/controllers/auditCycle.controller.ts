import { Request, Response } from "express";
import { Prisma } from "@prisma/client";
import { prisma } from "@/config/prisma";
import { asyncHandler } from "@/utils/asyncHandler";
import { AppError } from "@/utils/AppError";
import { createAuditCycleSchema, markAuditItemSchema } from "@/utils/validators/auditCycle.validator";
import { logActivity, notify } from "@/utils/activityLog";

const cycleSummarySelect = {
  id: true,
  name: true,
  scopeDepartmentId: true,
  scopeLocation: true,
  startDate: true,
  endDate: true,
  status: true,
  createdAt: true,
  closedAt: true,
  scopeDepartment: { select: { id: true, name: true } },
  createdBy: { select: { id: true, name: true } },
  auditors: { select: { auditor: { select: { id: true, name: true } } } },
  _count: { select: { items: true } },
} satisfies Prisma.AuditCycleSelect;

const cycleDetailSelect = {
  ...cycleSummarySelect,
  items: {
    select: {
      id: true,
      assetId: true,
      result: true,
      notes: true,
      checkedAt: true,
      asset: { select: { id: true, assetTag: true, name: true, status: true, location: true } },
    },
    orderBy: { asset: { assetTag: "asc" } },
  },
} satisfies Prisma.AuditCycleSelect;

async function buildCycleScope(req: Request): Promise<Prisma.AuditCycleWhereInput> {
  const { role, id } = req.user!;
  if (role === "ADMIN") return {};
  // "Auditor" isn't one of the 4 system roles — it's a per-cycle assignment
  // anyone can be given, so visibility is membership-based, not role-based.
  return { auditors: { some: { auditorId: id } } };
}

// A cycle audits whatever currently matches its scope at creation time — a
// department (assets currently held there), a location (Asset.location
// match), both (intersection), or neither (every asset — a full inventory
// sweep). The item list is a one-time snapshot, not a live query, so the
// checklist doesn't shift under the auditors' feet mid-cycle.
async function resolveScopeAssetIds(scopeDepartmentId?: string, scopeLocation?: string): Promise<string[]> {
  const where: Prisma.AssetWhereInput = {};
  if (scopeDepartmentId) {
    where.allocations = {
      some: {
        status: { in: ["ACTIVE", "RETURN_REQUESTED"] },
        OR: [{ departmentId: scopeDepartmentId }, { employee: { departmentId: scopeDepartmentId } }],
      },
    };
  }
  if (scopeLocation) {
    where.location = { equals: scopeLocation, mode: "insensitive" };
  }
  const assets = await prisma.asset.findMany({ where, select: { id: true } });
  return assets.map((a) => a.id);
}

export const listAuditCycles = asyncHandler(async (req: Request, res: Response) => {
  const scope = await buildCycleScope(req);
  const auditCycles = await prisma.auditCycle.findMany({
    where: scope,
    select: cycleSummarySelect,
    orderBy: { createdAt: "desc" },
  });
  res.json({ auditCycles });
});

export const getAuditCycle = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const scope = await buildCycleScope(req);
  const auditCycle = await prisma.auditCycle.findFirst({ where: { id, ...scope }, select: cycleDetailSelect });
  if (!auditCycle) throw new AppError(404, "Audit cycle not found");
  res.json({ auditCycle });
});

export const createAuditCycle = asyncHandler(async (req: Request, res: Response) => {
  const input = createAuditCycleSchema.parse(req.body);

  if (input.scopeDepartmentId) {
    const dept = await prisma.department.findUnique({ where: { id: input.scopeDepartmentId } });
    if (!dept) throw new AppError(400, "scopeDepartmentId does not refer to an existing department");
  }

  const auditors = await prisma.user.findMany({ where: { id: { in: input.auditorIds } } });
  if (auditors.length !== input.auditorIds.length) {
    throw new AppError(400, "One or more auditorIds do not refer to existing users");
  }

  const assetIds = await resolveScopeAssetIds(input.scopeDepartmentId, input.scopeLocation);
  if (assetIds.length === 0) {
    throw new AppError(400, "No assets match this audit scope");
  }

  const cycle = await prisma.auditCycle.create({
    data: {
      name: input.name,
      scopeDepartmentId: input.scopeDepartmentId,
      scopeLocation: input.scopeLocation,
      startDate: input.startDate,
      endDate: input.endDate,
      createdById: req.user!.id,
      auditors: { create: input.auditorIds.map((auditorId) => ({ auditorId })) },
      items: { create: assetIds.map((assetId) => ({ assetId })) },
    },
    select: cycleDetailSelect,
  });

  await logActivity({
    userId: req.user!.id,
    action: "CREATE_AUDIT_CYCLE",
    entityType: "AuditCycle",
    entityId: cycle.id,
    metadata: { name: cycle.name, assetCount: assetIds.length, auditorCount: input.auditorIds.length },
  });

  res.status(201).json({ auditCycle: cycle });
});

export const markAuditItem = asyncHandler(async (req: Request, res: Response) => {
  const { id: cycleId, itemId } = req.params;
  const { result, notes } = markAuditItemSchema.parse(req.body);

  const cycle = await prisma.auditCycle.findUnique({ where: { id: cycleId }, include: { auditors: true } });
  if (!cycle) throw new AppError(404, "Audit cycle not found");
  if (cycle.status === "CLOSED") throw new AppError(400, "This audit cycle is closed");

  const { role, id: userId } = req.user!;
  const isAssignedAuditor = cycle.auditors.some((a) => a.auditorId === userId);
  if (!isAssignedAuditor && role !== "ADMIN") {
    throw new AppError(403, "You are not an auditor on this cycle");
  }

  const item = await prisma.auditItem.findUnique({ where: { id: itemId }, include: { asset: true } });
  if (!item || item.auditCycleId !== cycleId) throw new AppError(404, "Audit item not found");

  const updated = await prisma.auditItem.update({
    where: { id: itemId },
    data: { result, notes, checkedAt: new Date() },
    select: {
      id: true,
      assetId: true,
      result: true,
      notes: true,
      checkedAt: true,
      asset: { select: { id: true, assetTag: true, name: true, status: true, location: true } },
    },
  });

  await logActivity({
    userId,
    action: "UPDATE_AUDIT_ITEM",
    entityType: "AuditItem",
    entityId: itemId,
    metadata: { assetTag: item.asset.assetTag, result },
  });

  if (result === "MISSING" || result === "DAMAGED") {
    await notify({
      userId: cycle.createdById,
      type: "AUDIT_DISCREPANCY",
      message: `${item.asset.name} (${item.asset.assetTag}) flagged as ${result} in audit cycle "${cycle.name}"`,
      relatedEntityType: "AuditItem",
      relatedEntityId: itemId,
    });
  }

  res.json({ item: updated });
});

// Locks the cycle and syncs asset statuses for confirmed-missing items —
// per spec, only MISSING flips the asset (to Lost). DAMAGED deliberately
// doesn't auto-route into Under Maintenance: that would skip the Maintenance
// module's own approval gate, which exists specifically so repairs don't
// start without sign-off. A damaged item found in audit still needs someone
// to raise a normal maintenance request for it.
export const closeAuditCycle = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const cycle = await prisma.auditCycle.findUnique({ where: { id }, include: { items: true } });
  if (!cycle) throw new AppError(404, "Audit cycle not found");
  if (cycle.status === "CLOSED") throw new AppError(400, "This audit cycle is already closed");

  const missingAssetIds = cycle.items.filter((i) => i.result === "MISSING").map((i) => i.assetId);

  const ops: Prisma.PrismaPromise<unknown>[] = [
    prisma.auditCycle.update({ where: { id }, data: { status: "CLOSED", closedAt: new Date() } }),
  ];
  if (missingAssetIds.length > 0) {
    ops.push(prisma.asset.updateMany({ where: { id: { in: missingAssetIds } }, data: { status: "LOST" } }));
  }
  await prisma.$transaction(ops);

  const updated = await prisma.auditCycle.findUnique({ where: { id }, select: cycleDetailSelect });

  await logActivity({
    userId: req.user!.id,
    action: "UPDATE_AUDIT_CYCLE",
    entityType: "AuditCycle",
    entityId: id,
    metadata: { change: "closed", missingCount: missingAssetIds.length },
  });

  res.json({ auditCycle: updated });
});
