import { z } from "zod";

export const createBookingSchema = z
  .object({
    assetId: z.string().uuid(),
    purpose: z.string().trim().optional(),
    startTime: z.coerce.date(),
    endTime: z.coerce.date(),
  })
  .refine((d) => d.endTime > d.startTime, { message: "endTime must be after startTime", path: ["endTime"] });

export const rescheduleBookingSchema = z
  .object({
    startTime: z.coerce.date(),
    endTime: z.coerce.date(),
  })
  .refine((d) => d.endTime > d.startTime, { message: "endTime must be after startTime", path: ["endTime"] });

export const listBookingsQuerySchema = z.object({
  assetId: z.string().uuid().optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
});

export type CreateBookingInput = z.infer<typeof createBookingSchema>;
export type RescheduleBookingInput = z.infer<typeof rescheduleBookingSchema>;
