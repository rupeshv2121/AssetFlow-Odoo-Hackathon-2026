import { z } from "zod";

export const createMaintenanceRequestSchema = z.object({
  assetId: z.string().uuid(),
  issueDescription: z.string().trim().min(3, "Describe the issue in a few more words"),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).default("MEDIUM"),
  photoUrl: z.string().trim().url().optional(),
});

export const assignTechnicianSchema = z.object({
  technicianName: z.string().trim().min(2, "Technician name is required"),
});

export const listMaintenanceQuerySchema = z.object({
  assetId: z.string().uuid().optional(),
  status: z
    .enum(["PENDING", "APPROVED", "REJECTED", "TECHNICIAN_ASSIGNED", "IN_PROGRESS", "RESOLVED"])
    .optional(),
});

export type CreateMaintenanceRequestInput = z.infer<typeof createMaintenanceRequestSchema>;
export type AssignTechnicianInput = z.infer<typeof assignTechnicianSchema>;
