import { Request, Response } from "express";
import { prisma } from "@/config/prisma";
import { asyncHandler } from "@/utils/asyncHandler";
import { AppError } from "@/utils/AppError";
import { createDepartmentSchema, updateDepartmentSchema } from "@/utils/validators/department.validator";
import { logActivity } from "@/utils/activityLog";

const summarySelect = {
  id: true,
  name: true,
  status: true,
  parentId: true,
  createdAt: true,
  head: { select: { id: true, name: true, email: true } },
  parent: { select: { id: true, name: true } },
  _count: { select: { employees: true } },
} as const;

async function assertValidHead(headId: string, tx: any) {
  const head = await tx.user.findUnique({ where: { id: headId } });
  if (!head) throw new AppError(400, "headId does not refer to an existing user");
  if (head.status !== "ACTIVE") {
    throw new AppError(400, "The selected user must be active");
  }
  if (head.role !== "DEPARTMENT_HEAD" && head.role !== "ADMIN") {
    await tx.user.update({
      where: { id: headId },
      data: { role: "DEPARTMENT_HEAD" },
    });
  }
}

async function assertValidParent(parentId: string, selfId?: string) {
  if (parentId === selfId) throw new AppError(400, "A department cannot be its own parent");
  const parent = await prisma.department.findUnique({ where: { id: parentId } });
  if (!parent) throw new AppError(400, "parentId does not refer to an existing department");
}

export const listDepartments = asyncHandler(async (_req: Request, res: Response) => {
  const departments = await prisma.department.findMany({
    select: summarySelect,
    orderBy: { name: "asc" },
  });
  res.json({ departments });
});

export const createDepartment = asyncHandler(async (req: Request, res: Response) => {
  const { name, headId, parentId } = createDepartmentSchema.parse(req.body);

  if (parentId) await assertValidParent(parentId);

  const department = await prisma.$transaction(async (tx) => {
    if (headId) {
      // Clear relationship if they headed another department
      await tx.department.updateMany({
        where: { headId },
        data: { headId: null },
      });
      await assertValidHead(headId, tx);
    }
    return tx.department.create({
      data: { name, headId, parentId },
      select: summarySelect,
    });
  });
  await logActivity({
    userId: req.user!.id,
    action: "CREATE_DEPARTMENT",
    entityType: "Department",
    entityId: department.id,
    metadata: { name: department.name },
  });
  res.status(201).json({ department });
});

export const updateDepartment = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const input = updateDepartmentSchema.parse(req.body);

  const existing = await prisma.department.findUnique({ where: { id } });
  if (!existing) throw new AppError(404, "Department not found");

  if (input.parentId) await assertValidParent(input.parentId, id);

  const department = await prisma.$transaction(async (tx) => {
    if (input.headId) {
      // Clear relationship if they headed another department
      await tx.department.updateMany({
        where: { headId: input.headId, NOT: { id } },
        data: { headId: null },
      });
      // Demote previous head of this department to EMPLOYEE
      if (existing.headId && existing.headId !== input.headId) {
        await tx.user.update({
          where: { id: existing.headId },
          data: { role: "EMPLOYEE" },
        });
      }
      await assertValidHead(input.headId, tx);
    } else if (input.headId === null && existing.headId) {
      // Demote previous head if explicitly setting to null
      await tx.user.update({
        where: { id: existing.headId },
        data: { role: "EMPLOYEE" },
      });
    }
    return tx.department.update({
      where: { id },
      data: input,
      select: summarySelect,
    });
  });
  await logActivity({
    userId: req.user!.id,
    action: "UPDATE_DEPARTMENT",
    entityType: "Department",
    entityId: department.id,
    metadata: { name: department.name },
  });
  res.json({ department });
});

// Hard-deleting a department with employees/allocations/bookings attached would
// either cascade destructively or violate FK constraints, so "delete" is a soft
// deactivate — matches the spec's "Create/edit/deactivate department".
export const deactivateDepartment = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const existing = await prisma.department.findUnique({ where: { id } });
  if (!existing) throw new AppError(404, "Department not found");

  const department = await prisma.department.update({
    where: { id },
    data: { status: "INACTIVE" },
    select: summarySelect,
  });
  await logActivity({
    userId: req.user!.id,
    action: "UPDATE_DEPARTMENT",
    entityType: "Department",
    entityId: department.id,
    metadata: { name: department.name, status: "INACTIVE" },
  });
  res.json({ department });
});
