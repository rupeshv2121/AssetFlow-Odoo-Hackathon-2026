import { Request, Response } from "express";
import { Prisma } from "@prisma/client";
import { prisma } from "@/config/prisma";
import { asyncHandler } from "@/utils/asyncHandler";

const HELD_STATUSES: Prisma.AllocationWhereInput["status"] = { in: ["ACTIVE", "RETURN_REQUESTED"] };
const OPEN_MAINTENANCE_STATUSES = ["APPROVED", "TECHNICIAN_ASSIGNED", "IN_PROGRESS"] as const;

const allocationSummarySelect = {
  id: true,
  expectedReturnDate: true,
  asset: { select: { id: true, assetTag: true, name: true } },
  employee: { select: { id: true, name: true } },
  department: { select: { id: true, name: true } },
} satisfies Prisma.AllocationSelect;

function toOverdueList(
  allocations: Prisma.AllocationGetPayload<{ select: typeof allocationSummarySelect }>[],
  now: Date
) {
  return allocations.map((a) => ({
    id: a.id,
    asset: a.asset,
    holder: a.employee?.name || a.department?.name || "—",
    expectedReturnDate: a.expectedReturnDate,
    daysOverdue: a.expectedReturnDate
      ? Math.max(1, Math.ceil((now.getTime() - a.expectedReturnDate.getTime()) / 86_400_000))
      : 0,
  }));
}

// Employee gets a personal view — org-wide asset counts aren't meaningful
// (and would leak org data an Employee isn't granted), so the shape differs
// slightly from the Admin/Asset Manager/Department Head response.
async function getEmployeeDashboard(userId: string) {
  const now = new Date();

  const [myAssets, overdue, upcomingReturns, activeBookings, openMaintenance, pendingTransfers] =
    await Promise.all([
      prisma.allocation.count({ where: { employeeId: userId, status: HELD_STATUSES } }),
      prisma.allocation.findMany({
        where: { employeeId: userId, status: HELD_STATUSES, expectedReturnDate: { lt: now } },
        select: allocationSummarySelect,
        orderBy: { expectedReturnDate: "asc" },
      }),
      prisma.allocation.count({
        where: { employeeId: userId, status: "ACTIVE", expectedReturnDate: { gte: now } },
      }),
      prisma.booking.count({ where: { bookedById: userId, status: { in: ["UPCOMING", "ONGOING"] } } }),
      prisma.maintenanceRequest.count({
        where: { raisedById: userId, status: { in: [...OPEN_MAINTENANCE_STATUSES, "PENDING"] } },
      }),
      prisma.allocationRequest.count({ where: { requestedById: userId, status: "REQUESTED" } }),
    ]);

  return {
    scope: "personal" as const,
    kpis: { myAssets, activeBookings, openMaintenance, pendingTransfers, upcomingReturns },
    overdueReturns: toOverdueList(overdue, now),
    assetsByStatus: [],
  };
}

export const getDashboard = asyncHandler(async (req: Request, res: Response) => {
  const { role, id } = req.user!;

  if (role === "EMPLOYEE") {
    return res.json(await getEmployeeDashboard(id));
  }

  const now = new Date();
  let departmentIds: string[] | null = null;
  if (role === "DEPARTMENT_HEAD") {
    const headed = await prisma.department.findMany({ where: { headId: id }, select: { id: true } });
    departmentIds = headed.map((d) => d.id);
  }

  const holderFilter: Prisma.AllocationWhereInput = departmentIds
    ? { OR: [{ departmentId: { in: departmentIds } }, { employee: { departmentId: { in: departmentIds } } }] }
    : {};

  const assetScopeFilter: Prisma.AssetWhereInput = departmentIds
    ? { allocations: { some: { status: HELD_STATUSES, ...holderFilter } } }
    : {};

  const bookingScopeFilter: Prisma.BookingWhereInput = departmentIds
    ? { OR: [{ departmentId: { in: departmentIds } }, { bookedBy: { departmentId: { in: departmentIds } } }] }
    : {};

  const transferScopeFilter: Prisma.AllocationRequestWhereInput = departmentIds
    ? {
        OR: [
          { fromDepartmentId: { in: departmentIds } },
          { toDepartmentId: { in: departmentIds } },
          { fromEmployee: { departmentId: { in: departmentIds } } },
          { toEmployee: { departmentId: { in: departmentIds } } },
        ],
      }
    : {};

  const [
    assetsAvailable,
    assetsAllocated,
    statusGroups,
    activeBookings,
    pendingTransfers,
    overdueAllocations,
    upcomingReturns,
    maintenanceActive,
    departmentCount,
    employeeCount,
  ] = await Promise.all([
    prisma.asset.count({ where: { ...assetScopeFilter, status: "AVAILABLE" } }),
    prisma.asset.count({ where: { ...assetScopeFilter, status: "ALLOCATED" } }),
    prisma.asset.groupBy({ by: ["status"], where: assetScopeFilter, _count: { _all: true } }),
    prisma.booking.count({ where: { ...bookingScopeFilter, status: { in: ["UPCOMING", "ONGOING"] } } }),
    prisma.allocationRequest.count({ where: { ...transferScopeFilter, status: "REQUESTED" } }),
    prisma.allocation.findMany({
      where: { status: HELD_STATUSES, expectedReturnDate: { lt: now }, ...holderFilter },
      select: allocationSummarySelect,
      orderBy: { expectedReturnDate: "asc" },
      take: 20,
    }),
    prisma.allocation.count({ where: { status: "ACTIVE", expectedReturnDate: { gte: now }, ...holderFilter } }),
    prisma.maintenanceRequest.count({
      where: {
        status: { in: [...OPEN_MAINTENANCE_STATUSES] },
        ...(departmentIds ? { asset: { allocations: { some: { status: HELD_STATUSES, ...holderFilter } } } } : {}),
      },
    }),
    departmentIds ? departmentIds.length : prisma.department.count({ where: { status: "ACTIVE" } }),
    departmentIds ? prisma.user.count({ where: { departmentId: { in: departmentIds } } }) : prisma.user.count(),
  ]);

  res.json({
    scope: departmentIds ? ("department" as const) : ("organization" as const),
    kpis: { assetsAvailable, assetsAllocated, maintenanceActive, activeBookings, pendingTransfers, upcomingReturns },
    overdueReturns: toOverdueList(overdueAllocations, now),
    assetsByStatus: statusGroups.map((g) => ({ status: g.status, count: g._count._all })),
    departmentCount,
    employeeCount,
  });
});
