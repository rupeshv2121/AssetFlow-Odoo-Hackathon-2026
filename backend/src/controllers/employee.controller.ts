import { Request, Response } from "express";
import { prisma } from "@/config/prisma";
import { asyncHandler } from "@/utils/asyncHandler";
import { AppError } from "@/utils/AppError";
import { updateEmployeeSchema, promoteEmployeeSchema } from "@/utils/validators/employee.validator";
import { logActivity } from "@/utils/activityLog";

const directorySelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  status: true,
  departmentId: true,
  department: { select: { id: true, name: true } },
  createdAt: true,
} as const;

// Admin sees everyone. Asset Manager sees everyone (needed to pick an
// allocation target). Department Head is scoped to departments they head —
// not granted the full directory, per the permission matrix.
export const listEmployees = asyncHandler(async (req: Request, res: Response) => {
  const { role, id } = req.user!;

  if (role === "DEPARTMENT_HEAD") {
    const headedDepartments = await prisma.department.findMany({
      where: { headId: id },
      select: { id: true },
    });
    const departmentIds = headedDepartments.map((d) => d.id);
    const employees = await prisma.user.findMany({
      where: { departmentId: { in: departmentIds } },
      select: directorySelect,
      orderBy: { name: "asc" },
    });
    return res.json({ employees });
  }

  const employees = await prisma.user.findMany({
    select: directorySelect,
    orderBy: { name: "asc" },
  });
  res.json({ employees });
});

export const updateEmployee = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const input = updateEmployeeSchema.parse(req.body);

  const existing = await prisma.user.findUnique({ where: { id } });
  if (!existing) throw new AppError(404, "Employee not found");

  if (input.departmentId) {
    const dept = await prisma.department.findUnique({ where: { id: input.departmentId } });
    if (!dept) throw new AppError(400, "departmentId does not refer to an existing department");
  }

  const employee = await prisma.user.update({
    where: { id },
    data: input,
    select: directorySelect,
  });
  await logActivity({
    userId: req.user!.id,
    action: "UPDATE_EMPLOYEE",
    entityType: "User",
    entityId: employee.id,
    metadata: { name: employee.name, ...input },
  });
  res.json({ employee });
});

export const promoteEmployee = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { role } = promoteEmployeeSchema.parse(req.body);

  const existing = await prisma.user.findUnique({ where: { id } });
  if (!existing) throw new AppError(404, "Employee not found");

  const employee = await prisma.$transaction(async (tx) => {
    const updated = await tx.user.update({ where: { id }, data: { role }, select: directorySelect });
    // Keep Department.headId consistent — a department can't be headed by
    // someone who no longer holds the Department Head role.
    if (role !== "DEPARTMENT_HEAD") {
      await tx.department.updateMany({ where: { headId: id }, data: { headId: null } });
    } else if (role === "DEPARTMENT_HEAD" && existing.departmentId) {
      // If promoted to DEPARTMENT_HEAD and they have a department, set them as head of that department
      await tx.department.update({
        where: { id: existing.departmentId },
        data: { headId: id },
      });
    }
    return updated;
  });

  await logActivity({
    userId: req.user!.id,
    action: "UPDATE_EMPLOYEE_ROLE",
    entityType: "User",
    entityId: employee.id,
    metadata: { name: employee.name, newRole: role },
  });
  res.json({ employee });
});
