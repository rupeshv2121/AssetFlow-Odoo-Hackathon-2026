import { z } from "zod";

export const createCategorySchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters"),
  extraFields: z.record(z.any()).optional(),
});

export const updateCategorySchema = z.object({
  name: z.string().trim().min(2).optional(),
  extraFields: z.record(z.any()).optional(),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
