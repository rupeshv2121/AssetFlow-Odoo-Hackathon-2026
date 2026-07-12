import { Request, Response } from "express";
import { Prisma, AssetStatus, AllocationStatus } from "@prisma/client";
import { prisma } from "@/config/prisma";
import { asyncHandler } from "@/utils/asyncHandler";
import { AppError } from "@/utils/AppError";
import {
  createAssetSchema,
  updateAssetSchema,
  updateAssetStatusSchema,
  listAssetsQuerySchema,
} from "@/utils/validators/asset.validator";
import { logActivity } from "@/utils/activityLog";

const HELD_STATUSES: AllocationStatus[] = ["ACTIVE", "RETURN_REQUESTED"];

const listSelect = {
  id: true,
  assetTag: true,
  name: true,
  category: { select: { id: true, name: true } },
  serialNumber: true,
  status: true,
  location: true,
  condition: true,
  isBookable: true,
  acquisitionDate: true,
  acquisitionCost: true,
  photoUrl: true,
  createdAt: true,
  allocations: {
    where: { status: { in: HELD_STATUSES } },
    take: 1,
    select: {
      id: true,
      expectedReturnDate: true,
      employee: { select: { id: true, name: true } },
      department: { select: { id: true, name: true } },
    },
  },
};

// Manual corrections only. ALLOCATED/RESERVED/UNDER_MAINTENANCE aren't listed
// as reachable — those are owned by the Allocation/Booking/Maintenance
// workflows (not built yet), never a direct status edit.
const ALLOWED_MANUAL_TRANSITIONS: Partial<Record<AssetStatus, AssetStatus[]>> = {
  AVAILABLE: ["LOST", "RETIRED", "DISPOSED"],
  LOST: ["AVAILABLE", "RETIRED", "DISPOSED"],
  RETIRED: ["AVAILABLE", "DISPOSED"],
  DISPOSED: [],
};

async function generateAssetTag(): Promise<string> {
  let n = (await prisma.asset.count()) + 1;
  for (let attempt = 0; attempt < 5; attempt++) {
    const tag = `AF-${String(n).padStart(4, "0")}`;
    const exists = await prisma.asset.findUnique({ where: { assetTag: tag } });
    if (!exists) return tag;
    n++;
  }
  throw new AppError(500, "Failed to generate a unique asset tag — try again");
}

// Admin/Asset Manager see everything. Department Head is scoped to assets
// currently held by their department or by someone in it. Employee is scoped
// to assets currently held by them personally. Bookable/shared resources
// (rooms, vehicles, shared equipment) are exempt from that scoping in every
// case — they're never individually allocated to anyone by design, so the
// held-by-me/held-by-my-department filter would otherwise hide every
// bookable resource from everyone but Admin/Asset Manager, defeating the
// point of a shared resource.
async function buildScopeFilter(req: Request): Promise<Prisma.AssetWhereInput> {
  const { role, id } = req.user!;

  if (role === "ADMIN" || role === "ASSET_MANAGER") return {};

  if (role === "DEPARTMENT_HEAD") {
    const headed = await prisma.department.findMany({ where: { headId: id }, select: { id: true } });
    const departmentIds = headed.map((d) => d.id);
    return {
      OR: [
        { isBookable: true },
        {
          allocations: {
            some: {
              status: { in: [...HELD_STATUSES] },
              OR: [{ departmentId: { in: departmentIds } }, { employee: { departmentId: { in: departmentIds } } }],
            },
          },
        },
      ],
    };
  }

  // EMPLOYEE
  return {
    OR: [{ isBookable: true }, { allocations: { some: { status: { in: [...HELD_STATUSES] }, employeeId: id } } }],
  };
}

// Wider than buildScopeFilter on purpose: the directory list only shows what
// you currently hold, but a single asset's detail page is also the legitimate
// destination for "I raised a maintenance request on this", "I have a pending
// transfer request for this asset someone else holds", "I used to hold this",
// or "I've booked this resource" — none of which imply current possession.
async function buildDetailScopeFilter(req: Request): Promise<Prisma.AssetWhereInput> {
  const { role, id } = req.user!;

  if (role === "ADMIN" || role === "ASSET_MANAGER") return {};

  if (role === "DEPARTMENT_HEAD") {
    const headed = await prisma.department.findMany({ where: { headId: id }, select: { id: true } });
    const departmentIds = headed.map((d) => d.id);
    return {
      OR: [
        { isBookable: true },
        {
          allocations: {
            some: { OR: [{ departmentId: { in: departmentIds } }, { employee: { departmentId: { in: departmentIds } } }] },
          },
        },
        { maintenanceRequests: { some: { raisedBy: { departmentId: { in: departmentIds } } } } },
        {
          allocationRequests: {
            some: {
              OR: [
                { fromDepartmentId: { in: departmentIds } },
                { toDepartmentId: { in: departmentIds } },
                { fromEmployee: { departmentId: { in: departmentIds } } },
                { toEmployee: { departmentId: { in: departmentIds } } },
                { requestedBy: { departmentId: { in: departmentIds } } },
              ],
            },
          },
        },
        { bookings: { some: { OR: [{ departmentId: { in: departmentIds } }, { bookedBy: { departmentId: { in: departmentIds } } }] } } },
      ],
    };
  }

  // EMPLOYEE
  return {
    OR: [
      { isBookable: true },
      { allocations: { some: { employeeId: id } } },
      { maintenanceRequests: { some: { raisedById: id } } },
      { allocationRequests: { some: { OR: [{ requestedById: id }, { fromEmployeeId: id }, { toEmployeeId: id }] } } },
      { bookings: { some: { bookedById: id } } },
    ],
  };
}

export const listAssets = asyncHandler(async (req: Request, res: Response) => {
  const query = listAssetsQuerySchema.parse(req.query);

  const where: Prisma.AssetWhereInput = {
    ...(await buildScopeFilter(req)),
    ...(query.categoryId && { categoryId: query.categoryId }),
    ...(query.status && { status: query.status }),
    ...(query.location && { location: { contains: query.location, mode: "insensitive" } }),
    ...(query.q && {
      OR: [
        { name: { contains: query.q, mode: "insensitive" } },
        { assetTag: { contains: query.q, mode: "insensitive" } },
        { serialNumber: { contains: query.q, mode: "insensitive" } },
      ],
    }),
  };

  const assets = await prisma.asset.findMany({ where, select: listSelect, orderBy: { createdAt: "desc" } });
  res.json({ assets });
});

export const getAsset = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const scope = await buildDetailScopeFilter(req);
  if (Object.keys(scope).length > 0) {
    const inScope = await prisma.asset.findFirst({ where: { id, ...scope }, select: { id: true } });
    if (!inScope) throw new AppError(404, "Asset not found");
  }

  const asset = await prisma.asset.findUnique({
    where: { id },
    include: {
      category: { select: { id: true, name: true } },
      allocations: {
        orderBy: { allocatedAt: "desc" },
        include: {
          employee: { select: { id: true, name: true } },
          department: { select: { id: true, name: true } },
        },
      },
      maintenanceRequests: {
        orderBy: { createdAt: "desc" },
        include: { raisedBy: { select: { id: true, name: true } } },
      },
    },
  });
  if (!asset) throw new AppError(404, "Asset not found");
  res.json({ asset });
});

export const createAsset = asyncHandler(async (req: Request, res: Response) => {
  const input = createAssetSchema.parse(req.body);

  const category = await prisma.assetCategory.findUnique({ where: { id: input.categoryId } });
  if (!category) throw new AppError(400, "categoryId does not refer to an existing category");

  const assetTag = await generateAssetTag();
  const asset = await prisma.asset.create({
    data: { ...input, assetTag },
    select: listSelect,
  });
  await logActivity({
    userId: req.user!.id,
    action: "CREATE_ASSET",
    entityType: "Asset",
    entityId: asset.id,
    metadata: { assetTag: asset.assetTag, name: asset.name },
  });
  res.status(201).json({ asset });
});

export const updateAsset = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const input = updateAssetSchema.parse(req.body);

  const existing = await prisma.asset.findUnique({ where: { id } });
  if (!existing) throw new AppError(404, "Asset not found");

  if (input.categoryId) {
    const category = await prisma.assetCategory.findUnique({ where: { id: input.categoryId } });
    if (!category) throw new AppError(400, "categoryId does not refer to an existing category");
  }

  const asset = await prisma.asset.update({ where: { id }, data: input, select: listSelect });
  await logActivity({
    userId: req.user!.id,
    action: "UPDATE_ASSET",
    entityType: "Asset",
    entityId: asset.id,
    metadata: { assetTag: asset.assetTag },
  });
  res.json({ asset });
});

export const updateAssetStatus = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = updateAssetStatusSchema.parse(req.body);

  const existing = await prisma.asset.findUnique({ where: { id } });
  if (!existing) throw new AppError(404, "Asset not found");

  const allowed = ALLOWED_MANUAL_TRANSITIONS[existing.status] || [];
  if (!allowed.includes(status)) {
    throw new AppError(
      400,
      `Cannot manually move an asset from ${existing.status} to ${status}. Allowed: ${allowed.join(", ") || "none"}`
    );
  }

  const asset = await prisma.asset.update({ where: { id }, data: { status }, select: listSelect });
  await logActivity({
    userId: req.user!.id,
    action: "UPDATE_ASSET_STATUS",
    entityType: "Asset",
    entityId: asset.id,
    metadata: { assetTag: asset.assetTag, from: existing.status, to: status },
  });
  res.json({ asset });
});
