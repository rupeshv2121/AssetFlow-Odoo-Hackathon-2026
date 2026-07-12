import { z } from "zod";

export const createAssetSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters"),
  categoryId: z.string().uuid("categoryId must reference a category"),
  serialNumber: z.string().trim().optional(),
  acquisitionDate: z.coerce.date().optional(),
  acquisitionCost: z.coerce.number().nonnegative().optional(),
  condition: z.string().trim().optional(),
  location: z.string().trim().optional(),
  isBookable: z.boolean().optional(),
  photoUrl: z.string().trim().url().optional(),
});

// status is deliberately excluded — lifecycle transitions go through
// updateAssetStatus (manual corrections) or the Allocation/Booking/Maintenance
// modules once they exist, never a blind field edit.
export const updateAssetSchema = z.object({
  name: z.string().trim().min(2).optional(),
  categoryId: z.string().uuid().optional(),
  serialNumber: z.string().trim().nullable().optional(),
  acquisitionDate: z.coerce.date().nullable().optional(),
  acquisitionCost: z.coerce.number().nonnegative().nullable().optional(),
  condition: z.string().trim().nullable().optional(),
  location: z.string().trim().nullable().optional(),
  isBookable: z.boolean().optional(),
  photoUrl: z.string().trim().url().nullable().optional(),
});

export const updateAssetStatusSchema = z.object({
  status: z.enum(["AVAILABLE", "LOST", "RETIRED", "DISPOSED"]),
});

export const listAssetsQuerySchema = z.object({
  q: z.string().trim().optional(),
  categoryId: z.string().uuid().optional(),
  status: z.enum(["AVAILABLE", "ALLOCATED", "RESERVED", "UNDER_MAINTENANCE", "LOST", "RETIRED", "DISPOSED"]).optional(),
  location: z.string().trim().optional(),
});

export type CreateAssetInput = z.infer<typeof createAssetSchema>;
export type UpdateAssetInput = z.infer<typeof updateAssetSchema>;
export type UpdateAssetStatusInput = z.infer<typeof updateAssetStatusSchema>;
export type ListAssetsQuery = z.infer<typeof listAssetsQuerySchema>;
