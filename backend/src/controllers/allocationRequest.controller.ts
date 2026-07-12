import { Request, Response } from "express";
import { Prisma } from "@prisma/client";
import { prisma } from "@/config/prisma";
import { asyncHandler } from "@/utils/asyncHandler";
import { AppError } from "@/utils/AppError";
import { createAllocationRequestSchema } from "@/utils/validators/allocationRequest.validator";

const HELD_STATUSES: Prisma.AllocationWhereInput["status"] = { in: ["ACTIVE", "RETURN_REQUESTED"] };

const requestSelect = {
  id: true,
  assetId: true,
  type: true,
  requestedById: true,
  fromEmployeeId: true,
  fromDepartmentId: true,
  toEmployeeId: true,
  toDepartmentId: true,
  status: true,
  approvedById: true,
  createdAt: true,
  resolvedAt: true,
  asset: { select: { id: true, assetTag: true, name: true, status: true } },
  requestedBy: { select: { id: true, name: true } },
  fromEmployee: { select: { id: true, name: true } },
  fromDepartment: { select: { id: true, name: true } },
  toEmployee: { select: { id: true, name: true } },
  toDepartment: { select: { id: true, name: true } },
} satisfies Prisma.AllocationRequestSelect;

type RequestRow = Prisma.AllocationRequestGetPayload<{ select: typeof requestSelect }>;

async function buildRequestScope(req: Request): Promise<Prisma.AllocationRequestWhereInput> {
  const { role, id } = req.user!;
  if (role === "ADMIN" || role === "ASSET_MANAGER") return {};

  if (role === "DEPARTMENT_HEAD") {
    const headed = await prisma.department.findMany({ where: { headId: id }, select: { id: true } });
    const deptIds = headed.map((d) => d.id);
    return {
      OR: [
        { fromDepartmentId: { in: deptIds } },
        { toDepartmentId: { in: deptIds } },
        { fromEmployee: { departmentId: { in: deptIds } } },
        { toEmployee: { departmentId: { in: deptIds } } },
      ],
    };
  }

  return { OR: [{ requestedById: id }, { toEmployeeId: id }, { fromEmployeeId: id }] };
}

async function assertCanApprove(req: Request, request: RequestRow) {
  const { role, id } = req.user!;
  if (role === "ADMIN" || role === "ASSET_MANAGER") return;

  if (role === "DEPARTMENT_HEAD") {
    const headed = await prisma.department.findMany({ where: { headId: id }, select: { id: true } });
    const deptIds = headed.map((d) => d.id);
    if (deptIds.length > 0) {
      const departmentIds = [request.fromDepartmentId, request.toDepartmentId].filter((d): d is string => !!d);
      if (departmentIds.some((d) => deptIds.includes(d))) return;

      const employeeIds = [request.fromEmployeeId, request.toEmployeeId].filter((e): e is string => !!e);
      if (employeeIds.length > 0) {
        const count = await prisma.user.count({ where: { id: { in: employeeIds }, departmentId: { in: deptIds } } });
        if (count > 0) return;
      }
    }
  }

  throw new AppError(403, "You can only approve requests involving your own department");
}

export const listAllocationRequests = asyncHandler(async (req: Request, res: Response) => {
  const scope = await buildRequestScope(req);
  const allocationRequests = await prisma.allocationRequest.findMany({
    where: scope,
    select: requestSelect,
    orderBy: { createdAt: "desc" },
  });
  res.json({ allocationRequests });
});

// Auto-detects ALLOCATION (asset currently Available) vs TRANSFER (asset
// currently held by someone else) based on the asset's live state — the
// caller just says "I want this asset."
export const createAllocationRequest = asyncHandler(async (req: Request, res: Response) => {
  const input = createAllocationRequestSchema.parse(req.body);

  const asset = await prisma.asset.findUnique({ where: { id: input.assetId } });
  if (!asset) throw new AppError(404, "Asset not found");

  const currentAllocation = await prisma.allocation.findFirst({
    where: { assetId: asset.id, status: HELD_STATUSES },
  });

  if (currentAllocation) {
    if (currentAllocation.employeeId === req.user!.id) {
      throw new AppError(400, "You already hold this asset");
    }
  } else if (asset.status !== "AVAILABLE") {
    throw new AppError(400, `Asset is ${asset.status} — it can't be requested right now`);
  }

  if (input.toEmployeeId) {
    const user = await prisma.user.findUnique({ where: { id: input.toEmployeeId } });
    if (!user) throw new AppError(400, "toEmployeeId does not refer to an existing user");
  }
  if (input.toDepartmentId) {
    const dept = await prisma.department.findUnique({ where: { id: input.toDepartmentId } });
    if (!dept) throw new AppError(400, "toDepartmentId does not refer to an existing department");
  }

  const allocationRequest = await prisma.allocationRequest.create({
    data: {
      assetId: asset.id,
      type: currentAllocation ? "TRANSFER" : "ALLOCATION",
      requestedById: req.user!.id,
      fromEmployeeId: currentAllocation?.employeeId ?? undefined,
      fromDepartmentId: currentAllocation?.departmentId ?? undefined,
      toEmployeeId: input.toEmployeeId,
      toDepartmentId: input.toDepartmentId,
    },
    select: requestSelect,
  });
  res.status(201).json({ allocationRequest });
});

export const approveAllocationRequest = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const request = await prisma.allocationRequest.findUnique({ where: { id }, select: requestSelect });
  if (!request) throw new AppError(404, "Request not found");
  if (request.status !== "REQUESTED") throw new AppError(400, `Request is already ${request.status}`);

  await assertCanApprove(req, request);

  const currentAllocation = await prisma.allocation.findFirst({
    where: { assetId: request.assetId, status: HELD_STATUSES },
  });

  if (request.type === "ALLOCATION" && currentAllocation) {
    throw new AppError(409, "This asset has since been allocated to someone else");
  }
  if (request.type === "TRANSFER" && !currentAllocation) {
    throw new AppError(409, "This asset is no longer allocated — nothing to transfer");
  }

  const ops: Prisma.PrismaPromise<unknown>[] = [];
  if (currentAllocation) {
    ops.push(
      prisma.allocation.update({
        where: { id: currentAllocation.id },
        data: { status: "RETURNED", returnedAt: new Date(), returnCondition: "Transferred to new holder" },
      })
    );
  }
  ops.push(
    prisma.allocation.create({
      data: {
        assetId: request.assetId,
        employeeId: request.toEmployeeId ?? undefined,
        departmentId: request.toDepartmentId ?? undefined,
      },
    })
  );
  ops.push(prisma.asset.update({ where: { id: request.assetId }, data: { status: "ALLOCATED" } }));
  ops.push(
    prisma.allocationRequest.update({
      where: { id },
      data: { status: "APPROVED", approvedById: req.user!.id, resolvedAt: new Date() },
    })
  );

  await prisma.$transaction(ops);

  const updated = await prisma.allocationRequest.findUnique({ where: { id }, select: requestSelect });
  res.json({ allocationRequest: updated });
});

export const rejectAllocationRequest = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const request = await prisma.allocationRequest.findUnique({ where: { id }, select: requestSelect });
  if (!request) throw new AppError(404, "Request not found");
  if (request.status !== "REQUESTED") throw new AppError(400, `Request is already ${request.status}`);

  await assertCanApprove(req, request);

  const updated = await prisma.allocationRequest.update({
    where: { id },
    data: { status: "REJECTED", approvedById: req.user!.id, resolvedAt: new Date() },
    select: requestSelect,
  });
  res.json({ allocationRequest: updated });
});
