import { Request, Response } from "express";
import { Prisma } from "@prisma/client";
import { prisma } from "@/config/prisma";
import { asyncHandler } from "@/utils/asyncHandler";
import { AppError } from "@/utils/AppError";
import { createAllocationSchema, returnAllocationSchema } from "@/utils/validators/allocation.validator";

const HELD_STATUSES: Prisma.AllocationWhereInput["status"] = { in: ["ACTIVE", "RETURN_REQUESTED"] };

const allocationSelect = {
  id: true,
  assetId: true,
  employeeId: true,
  departmentId: true,
  allocatedAt: true,
  expectedReturnDate: true,
  returnRequestedAt: true,
  returnedAt: true,
  returnCondition: true,
  status: true,
  createdAt: true,
  asset: { select: { id: true, assetTag: true, name: true, status: true } },
  employee: { select: { id: true, name: true, email: true } },
  department: { select: { id: true, name: true } },
} satisfies Prisma.AllocationSelect;

async function buildAllocationScope(req: Request): Promise<Prisma.AllocationWhereInput> {
  const { role, id } = req.user!;
  if (role === "ADMIN" || role === "ASSET_MANAGER") return {};

  if (role === "DEPARTMENT_HEAD") {
    const headed = await prisma.department.findMany({ where: { headId: id }, select: { id: true } });
    const deptIds = headed.map((d) => d.id);
    return { OR: [{ departmentId: { in: deptIds } }, { employee: { departmentId: { in: deptIds } } }] };
  }

  return { employeeId: id };
}

export const listAllocations = asyncHandler(async (req: Request, res: Response) => {
  const scope = await buildAllocationScope(req);
  const allocations = await prisma.allocation.findMany({
    where: scope,
    select: allocationSelect,
    orderBy: { allocatedAt: "desc" },
  });
  res.json({ allocations });
});

// Direct allocation by an Asset Manager/Admin. Blocked outright if the asset
// is already held by someone — the caller is expected to use a transfer
// request instead (see allocationRequest.controller.ts).
export const createAllocation = asyncHandler(async (req: Request, res: Response) => {
  const input = createAllocationSchema.parse(req.body);

  const asset = await prisma.asset.findUnique({ where: { id: input.assetId } });
  if (!asset) throw new AppError(404, "Asset not found");

  const existing = await prisma.allocation.findFirst({
    where: { assetId: asset.id, status: HELD_STATUSES },
    include: { employee: { select: { name: true } }, department: { select: { name: true } } },
  });
  if (existing) {
    const holder = existing.employee?.name || existing.department?.name || "another holder";
    throw new AppError(409, `This asset is currently held by ${holder} — use a Transfer Request instead`);
  }
  if (asset.status !== "AVAILABLE") {
    throw new AppError(400, `Asset is ${asset.status}, not Available — it can't be allocated right now`);
  }

  if (input.employeeId) {
    const user = await prisma.user.findUnique({ where: { id: input.employeeId } });
    if (!user) throw new AppError(400, "employeeId does not refer to an existing user");
  }
  if (input.departmentId) {
    const dept = await prisma.department.findUnique({ where: { id: input.departmentId } });
    if (!dept) throw new AppError(400, "departmentId does not refer to an existing department");
  }

  await prisma.$transaction([
    prisma.allocation.create({
      data: {
        assetId: asset.id,
        employeeId: input.employeeId,
        departmentId: input.departmentId,
        expectedReturnDate: input.expectedReturnDate,
      },
    }),
    prisma.asset.update({ where: { id: asset.id }, data: { status: "ALLOCATED" } }),
  ]);

  const allocation = await prisma.allocation.findFirst({
    where: { assetId: asset.id, status: "ACTIVE" },
    select: allocationSelect,
    orderBy: { allocatedAt: "desc" },
  });
  res.status(201).json({ allocation });
});

// The holder (or an Asset Manager/Admin on their behalf) flags that the asset
// is coming back. Doesn't free the asset yet — markReturned does that, after
// an Asset Manager records a condition check-in note.
export const requestReturn = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const allocation = await prisma.allocation.findUnique({ where: { id } });
  if (!allocation) throw new AppError(404, "Allocation not found");
  if (allocation.status !== "ACTIVE") {
    throw new AppError(400, `Cannot request a return — allocation is already ${allocation.status}`);
  }

  const { role, id: userId } = req.user!;
  const isHolder = allocation.employeeId === userId;
  const isPrivileged = role === "ADMIN" || role === "ASSET_MANAGER";
  if (!isHolder && !isPrivileged) {
    throw new AppError(403, "Only the current holder or an Asset Manager can request a return");
  }

  const updated = await prisma.allocation.update({
    where: { id },
    data: { status: "RETURN_REQUESTED", returnRequestedAt: new Date() },
    select: allocationSelect,
  });
  res.json({ allocation: updated });
});

export const markReturned = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { returnCondition } = returnAllocationSchema.parse(req.body);

  const allocation = await prisma.allocation.findUnique({ where: { id } });
  if (!allocation) throw new AppError(404, "Allocation not found");
  if (allocation.status === "RETURNED") throw new AppError(400, "Allocation is already marked as returned");

  await prisma.$transaction([
    prisma.allocation.update({
      where: { id },
      data: { status: "RETURNED", returnedAt: new Date(), returnCondition },
    }),
    prisma.asset.update({ where: { id: allocation.assetId }, data: { status: "AVAILABLE" } }),
  ]);

  const updated = await prisma.allocation.findUnique({ where: { id }, select: allocationSelect });
  res.json({ allocation: updated });
});
