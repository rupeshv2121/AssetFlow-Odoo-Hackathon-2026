import { Request, Response } from "express";
import { Prisma, MaintenancePriority } from "@prisma/client";
import { prisma } from "@/config/prisma";
import { asyncHandler } from "@/utils/asyncHandler";

const OPEN_MAINTENANCE_STATUSES = ["PENDING", "APPROVED", "TECHNICIAN_ASSIGNED", "IN_PROGRESS"] as const;
const AGING_THRESHOLD_YEARS = 3;
const PRIORITY_RANK: Record<MaintenancePriority, number> = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };

async function resolveScope(req: Request) {
  const { role, id } = req.user!;
  if (role !== "DEPARTMENT_HEAD") return { scope: "organization" as const, departmentIds: null as string[] | null };

  const headed = await prisma.department.findMany({ where: { headId: id }, select: { id: true } });
  return { scope: "department" as const, departmentIds: headed.map((d) => d.id) };
}

export const getReports = asyncHandler(async (req: Request, res: Response) => {
  const { scope, departmentIds } = await resolveScope(req);

  // Utilization is scoped to assets the department has EVER touched (any
  // allocation status), not just currently-held ones — a history question,
  // not a "who has it right now" question.
  const assetScope: Prisma.AssetWhereInput = departmentIds
    ? {
        allocations: {
          some: { OR: [{ departmentId: { in: departmentIds } }, { employee: { departmentId: { in: departmentIds } } }] },
        },
      }
    : {};

  const bookingScope: Prisma.BookingWhereInput = departmentIds
    ? { OR: [{ departmentId: { in: departmentIds } }, { bookedBy: { departmentId: { in: departmentIds } } }] }
    : {};

  const [assetsWithUsage, openMaintenanceRequests, activeAllocations, bookings] = await Promise.all([
    prisma.asset.findMany({
      where: assetScope,
      select: {
        id: true,
        assetTag: true,
        name: true,
        status: true,
        acquisitionDate: true,
        category: { select: { id: true, name: true } },
        _count: { select: { allocations: true, bookings: true, maintenanceRequests: true } },
      },
    }),
    prisma.maintenanceRequest.findMany({
      where: { status: { in: [...OPEN_MAINTENANCE_STATUSES] }, asset: assetScope },
      select: {
        assetId: true,
        priority: true,
        asset: { select: { id: true, assetTag: true, name: true } },
      },
    }),
    prisma.allocation.findMany({
      where: {
        status: { in: ["ACTIVE", "RETURN_REQUESTED"] },
        ...(departmentIds && {
          OR: [{ departmentId: { in: departmentIds } }, { employee: { departmentId: { in: departmentIds } } }],
        }),
      },
      select: {
        department: { select: { id: true, name: true } },
        employee: { select: { department: { select: { id: true, name: true } } } },
      },
    }),
    prisma.booking.findMany({
      where: { status: { not: "CANCELLED" }, ...bookingScope },
      select: { startTime: true },
    }),
  ]);

  // --- Utilization: most-used vs idle ---
  const withUsage = assetsWithUsage.map((a) => ({
    assetId: a.id,
    assetTag: a.assetTag,
    name: a.name,
    status: a.status,
    category: a.category,
    acquisitionDate: a.acquisitionDate,
    allocationCount: a._count.allocations,
    bookingCount: a._count.bookings,
    maintenanceCount: a._count.maintenanceRequests,
    totalUsage: a._count.allocations + a._count.bookings,
  }));

  const mostUsed = [...withUsage]
    .filter((a) => a.totalUsage > 0)
    .sort((a, b) => b.totalUsage - a.totalUsage)
    .slice(0, 10);
  const idle = withUsage.filter((a) => a.totalUsage === 0).slice(0, 20);

  // --- Maintenance frequency ---
  const maintenanceByAsset = [...withUsage]
    .filter((a) => a.maintenanceCount > 0)
    .sort((a, b) => b.maintenanceCount - a.maintenanceCount)
    .slice(0, 10)
    .map(({ assetId, assetTag, name, maintenanceCount }) => ({ assetId, assetTag, name, count: maintenanceCount }));

  const categoryMap = new Map<string, { categoryId: string; categoryName: string; count: number }>();
  for (const a of withUsage) {
    if (a.maintenanceCount === 0) continue;
    const entry = categoryMap.get(a.category.id) || {
      categoryId: a.category.id,
      categoryName: a.category.name,
      count: 0,
    };
    entry.count += a.maintenanceCount;
    categoryMap.set(a.category.id, entry);
  }
  const maintenanceByCategory = [...categoryMap.values()].sort((a, b) => b.count - a.count);

  // --- Attention needed ---
  const dueMap = new Map<
    string,
    { assetId: string; assetTag: string; name: string; openRequestCount: number; highestPriority: MaintenancePriority }
  >();
  for (const r of openMaintenanceRequests) {
    const entry = dueMap.get(r.assetId) || {
      assetId: r.asset.id,
      assetTag: r.asset.assetTag,
      name: r.asset.name,
      openRequestCount: 0,
      highestPriority: "LOW" as MaintenancePriority,
    };
    entry.openRequestCount++;
    if (PRIORITY_RANK[r.priority] > PRIORITY_RANK[entry.highestPriority]) entry.highestPriority = r.priority;
    dueMap.set(r.assetId, entry);
  }
  const dueForMaintenance = [...dueMap.values()].sort(
    (a, b) => PRIORITY_RANK[b.highestPriority] - PRIORITY_RANK[a.highestPriority]
  );

  const now = new Date();
  const agingAssets = withUsage
    .filter((a) => a.acquisitionDate)
    .map((a) => ({
      assetId: a.assetId,
      assetTag: a.assetTag,
      name: a.name,
      acquisitionDate: a.acquisitionDate,
      ageYears: (now.getTime() - new Date(a.acquisitionDate!).getTime()) / (365.25 * 86_400_000),
    }))
    .filter((a) => a.ageYears >= AGING_THRESHOLD_YEARS)
    .sort((a, b) => b.ageYears - a.ageYears);

  // --- Department-wise allocation summary ---
  const deptMap = new Map<string, { departmentId: string; departmentName: string; activeAllocationCount: number }>();
  for (const a of activeAllocations) {
    const dept = a.department || a.employee?.department;
    if (!dept) continue;
    const entry = deptMap.get(dept.id) || { departmentId: dept.id, departmentName: dept.name, activeAllocationCount: 0 };
    entry.activeAllocationCount++;
    deptMap.set(dept.id, entry);
  }
  const departmentAllocationSummary = [...deptMap.values()].sort(
    (a, b) => b.activeAllocationCount - a.activeAllocationCount
  );

  // --- Resource booking heatmap (day-of-week x hour-of-day) ---
  const matrix: number[][] = Array.from({ length: 7 }, () => Array.from({ length: 24 }, () => 0));
  for (const b of bookings) {
    const d = new Date(b.startTime);
    matrix[d.getDay()][d.getHours()]++;
  }
  const maxCount = Math.max(0, ...matrix.flat());

  res.json({
    scope,
    utilization: { mostUsed, idle },
    maintenanceFrequency: { byAsset: maintenanceByAsset, byCategory: maintenanceByCategory },
    attentionNeeded: { dueForMaintenance, agingAssets, agingThresholdYears: AGING_THRESHOLD_YEARS },
    departmentAllocationSummary,
    bookingHeatmap: { matrix, maxCount },
  });
});
