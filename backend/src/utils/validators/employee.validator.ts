import { z } from "zod";

export const updateEmployeeSchema = z.object({
  departmentId: z.string().uuid().nullable().optional(),
  status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
});

// ADMIN is deliberately excluded — this endpoint mirrors the two promote
// buttons in the Employee Directory UI (-> Department Head / -> Asset
// Manager), plus a demote-back-to-Employee option. Granting Admin here would
// let one admin silently mint another, contrary to "no self-assigned admin roles".
export const promoteEmployeeSchema = z.object({
  role: z.enum(["EMPLOYEE", "DEPARTMENT_HEAD", "ASSET_MANAGER"]),
});

export type UpdateEmployeeInput = z.infer<typeof updateEmployeeSchema>;
export type PromoteEmployeeInput = z.infer<typeof promoteEmployeeSchema>;
