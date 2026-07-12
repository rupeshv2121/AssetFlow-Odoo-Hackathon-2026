import { z } from "zod";

export const createAuditCycleSchema = z
  .object({
    name: z.string().trim().min(2, "Name must be at least 2 characters"),
    scopeDepartmentId: z.string().uuid().optional(),
    scopeLocation: z.string().trim().optional(),
    startDate: z.coerce.date(),
    endDate: z.coerce.date(),
    auditorIds: z.array(z.string().uuid()).min(1, "Assign at least one auditor"),
  })
  .refine((d) => d.endDate >= d.startDate, { message: "endDate must be on or after startDate", path: ["endDate"] });

export const markAuditItemSchema = z.object({
  result: z.enum(["VERIFIED", "MISSING", "DAMAGED"]),
  notes: z.string().trim().optional(),
});

export type CreateAuditCycleInput = z.infer<typeof createAuditCycleSchema>;
export type MarkAuditItemInput = z.infer<typeof markAuditItemSchema>;
