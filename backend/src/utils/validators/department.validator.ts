import { z } from "zod";

export const createDepartmentSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters"),
  headId: z.string().uuid().optional(),
  parentId: z.string().uuid().optional(),
});

export const updateDepartmentSchema = z.object({
  name: z.string().trim().min(2).optional(),
  headId: z.string().uuid().nullable().optional(),
  parentId: z.string().uuid().nullable().optional(),
  status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
});

export type CreateDepartmentInput = z.infer<typeof createDepartmentSchema>;
export type UpdateDepartmentInput = z.infer<typeof updateDepartmentSchema>;
