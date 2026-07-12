import { Request, Response } from "express";
import { prisma } from "@/config/prisma";
import { asyncHandler } from "@/utils/asyncHandler";
import { AppError } from "@/utils/AppError";
import { createDepartmentSchema, updateDepartmentSchema } from "@/utils/validators/department.validator";

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

async function assertValidHead(headId: string) {
  const head = await prisma.user.findUnique({ where: { id: headId } });
  if (!head) throw new AppError(400, "headId does not refer to an existing user");
  if (head.role !== "DEPARTMENT_HEAD") {
    throw new AppError(400, "The selected user must already hold the Department Head role — promote them from the Employee Directory first");
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

  if (headId) await assertValidHead(headId);
  if (parentId) await assertValidParent(parentId);

  const department = await prisma.department.create({
    data: { name, headId, parentId },
    select: summarySelect,
  });
  res.status(201).json({ department });
});

export const updateDepartment = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const input = updateDepartmentSchema.parse(req.body);

  const existing = await prisma.department.findUnique({ where: { id } });
  if (!existing) throw new AppError(404, "Department not found");

  if (input.headId) await assertValidHead(input.headId);
  if (input.parentId) await assertValidParent(input.parentId, id);

  const department = await prisma.department.update({
    where: { id },
    data: input,
    select: summarySelect,
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
  res.json({ department });
});
