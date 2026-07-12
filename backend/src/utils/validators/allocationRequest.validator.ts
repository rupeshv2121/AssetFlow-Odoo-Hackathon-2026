import { z } from "zod";

export const createAllocationRequestSchema = z
  .object({
    assetId: z.string().uuid(),
    toEmployeeId: z.string().uuid().optional(),
    toDepartmentId: z.string().uuid().optional(),
  })
  .refine((d) => Boolean(d.toEmployeeId) !== Boolean(d.toDepartmentId), {
    message: "Provide exactly one of toEmployeeId or toDepartmentId",
  });

export type CreateAllocationRequestInput = z.infer<typeof createAllocationRequestSchema>;
