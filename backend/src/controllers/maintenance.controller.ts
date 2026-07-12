import { Request, Response } from "express";
import { Prisma } from "@prisma/client";
import { prisma } from "@/config/prisma";
import { asyncHandler } from "@/utils/asyncHandler";
import { AppError } from "@/utils/AppError";
import {
  createMaintenanceRequestSchema,
  assignTechnicianSchema,
  listMaintenanceQuerySchema,
} from "@/utils/validators/maintenance.validator";

const maintenanceSelect = {
  id: true,
  assetId: true,
  raisedById: true,
  issueDescription: true,
  priority: true,
  photoUrl: true,
  status: true,
  approvedById: true,
  technicianName: true,
  resolvedAt: true,
  createdAt: true,
  updatedAt: true,
  asset: { select: { id: true, assetTag: true, name: true, status: true } },
  raisedBy: { select: { id: true, name: true } },
  approvedBy: { select: { id: true, name: true } },
} satisfies Prisma.MaintenanceRequestSelect;

async function buildMaintenanceScope(req: Request): Promise<Prisma.MaintenanceRequestWhereInput> {
  const { role, id } = req.user!;
  if (role === "ADMIN" || role === "ASSET_MANAGER") return {};

  if (role === "DEPARTMENT_HEAD") {
    const headed = await prisma.department.findMany({ where: { headId: id }, select: { id: true } });
    const deptIds = headed.map((d) => d.id);
    return {
      OR: [
        { raisedById: id },
        {
          asset: {
            allocations: {
              some: {
                status: { in: ["ACTIVE", "RETURN_REQUESTED"] },
                OR: [{ departmentId: { in: deptIds } }, { employee: { departmentId: { in: deptIds } } }],
              },
            },
          },
        },
      ],
    };
  }

  return { raisedById: id };
}

async function getRequestOr404(id: string) {
  const request = await prisma.maintenanceRequest.findUnique({ where: { id }, include: { asset: true } });
  if (!request) throw new AppError(404, "Maintenance request not found");
  return request;
}

export const listMaintenanceRequests = asyncHandler(async (req: Request, res: Response) => {
  const query = listMaintenanceQuerySchema.parse(req.query);
  const scope = await buildMaintenanceScope(req);
  const where: Prisma.MaintenanceRequestWhereInput = {
    ...scope,
    ...(query.assetId && { assetId: query.assetId }),
    ...(query.status && { status: query.status }),
  };
  const maintenanceRequests = await prisma.maintenanceRequest.findMany({
    where,
    select: maintenanceSelect,
    orderBy: { createdAt: "desc" },
  });
  res.json({ maintenanceRequests });
});

// Anyone can report an issue on any asset — not just the current holder —
// since shared/idle equipment can break too. No asset-status precondition
// beyond "not already permanently gone".
export const createMaintenanceRequest = asyncHandler(async (req: Request, res: Response) => {
  const input = createMaintenanceRequestSchema.parse(req.body);

  const asset = await prisma.asset.findUnique({ where: { id: input.assetId } });
  if (!asset) throw new AppError(404, "Asset not found");
  if (asset.status === "RETIRED" || asset.status === "DISPOSED") {
    throw new AppError(400, `Cannot raise a maintenance request — asset is ${asset.status}`);
  }

  const maintenanceRequest = await prisma.maintenanceRequest.create({
    data: {
      assetId: asset.id,
      raisedById: req.user!.id,
      issueDescription: input.issueDescription,
      priority: input.priority,
      photoUrl: input.photoUrl,
    },
    select: maintenanceSelect,
  });
  res.status(201).json({ maintenanceRequest });
});

export const approveMaintenanceRequest = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const request = await getRequestOr404(id);
  if (request.status !== "PENDING") throw new AppError(400, `Request is already ${request.status}`);
  if (["LOST", "RETIRED", "DISPOSED"].includes(request.asset.status)) {
    throw new AppError(400, `Cannot approve — asset is ${request.asset.status}`);
  }

  await prisma.$transaction([
    prisma.maintenanceRequest.update({ where: { id }, data: { status: "APPROVED", approvedById: req.user!.id } }),
    prisma.asset.update({ where: { id: request.assetId }, data: { status: "UNDER_MAINTENANCE" } }),
  ]);

  const updated = await prisma.maintenanceRequest.findUnique({ where: { id }, select: maintenanceSelect });
  res.json({ maintenanceRequest: updated });
});

export const rejectMaintenanceRequest = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const request = await getRequestOr404(id);
  if (request.status !== "PENDING") throw new AppError(400, `Request is already ${request.status}`);

  const updated = await prisma.maintenanceRequest.update({
    where: { id },
    data: { status: "REJECTED", approvedById: req.user!.id, resolvedAt: new Date() },
    select: maintenanceSelect,
  });
  res.json({ maintenanceRequest: updated });
});

export const assignTechnician = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { technicianName } = assignTechnicianSchema.parse(req.body);
  const request = await getRequestOr404(id);
  if (request.status !== "APPROVED") {
    throw new AppError(400, `Cannot assign a technician — request is ${request.status}, not Approved`);
  }

  const updated = await prisma.maintenanceRequest.update({
    where: { id },
    data: { status: "TECHNICIAN_ASSIGNED", technicianName },
    select: maintenanceSelect,
  });
  res.json({ maintenanceRequest: updated });
});

export const startMaintenanceWork = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const request = await getRequestOr404(id);
  if (request.status !== "TECHNICIAN_ASSIGNED") {
    throw new AppError(400, `Cannot start work — request is ${request.status}, not Technician Assigned`);
  }

  const updated = await prisma.maintenanceRequest.update({
    where: { id },
    data: { status: "IN_PROGRESS" },
    select: maintenanceSelect,
  });
  res.json({ maintenanceRequest: updated });
});

export const resolveMaintenanceRequest = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const request = await getRequestOr404(id);
  if (request.status !== "IN_PROGRESS") {
    throw new AppError(400, `Cannot resolve — request is ${request.status}, not In Progress`);
  }

  await prisma.$transaction([
    prisma.maintenanceRequest.update({ where: { id }, data: { status: "RESOLVED", resolvedAt: new Date() } }),
    prisma.asset.update({ where: { id: request.assetId }, data: { status: "AVAILABLE" } }),
  ]);

  const updated = await prisma.maintenanceRequest.findUnique({ where: { id }, select: maintenanceSelect });
  res.json({ maintenanceRequest: updated });
});
