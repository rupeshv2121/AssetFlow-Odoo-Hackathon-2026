import { z } from "zod";

export const createAllocationSchema = z
  .object({
    assetId: z.string().uuid(),
    employeeId: z.string().uuid().optional(),
    departmentId: z.string().uuid().optional(),
    expectedReturnDate: z.coerce.date().optional(),
  })
  .refine((d) => Boolean(d.employeeId) !== Boolean(d.departmentId), {
    message: "Provide exactly one of employeeId or departmentId",
  });

export const returnAllocationSchema = z.object({
  returnCondition: z.string().trim().optional(),
});

export type CreateAllocationInput = z.infer<typeof createAllocationSchema>;
export type ReturnAllocationInput = z.infer<typeof returnAllocationSchema>;
