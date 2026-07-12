import { Request, Response } from "express";
import { Prisma, BookingStatus } from "@prisma/client";
import { prisma } from "@/config/prisma";
import { asyncHandler } from "@/utils/asyncHandler";
import { AppError } from "@/utils/AppError";
import {
  createBookingSchema,
  rescheduleBookingSchema,
  listBookingsQuerySchema,
} from "@/utils/validators/booking.validator";
import { logActivity, notify } from "@/utils/activityLog";

const PRIVILEGED_ROLES = ["ADMIN", "ASSET_MANAGER", "DEPARTMENT_HEAD"];

const bookingSelect = {
  id: true,
  assetId: true,
  bookedById: true,
  departmentId: true,
  purpose: true,
  startTime: true,
  endTime: true,
  status: true,
  createdAt: true,
  asset: { select: { id: true, assetTag: true, name: true } },
  bookedBy: { select: { id: true, name: true } },
  department: { select: { id: true, name: true } },
} satisfies Prisma.BookingSelect;

type BookingRow = Prisma.BookingGetPayload<{ select: typeof bookingSelect }>;

// Only ever persisted as UPCOMING or CANCELLED — Ongoing/Completed are
// derived from the clock at read time so nothing needs a cron job to keep
// statuses honest.
function withComputedStatus<T extends { status: BookingStatus; startTime: Date; endTime: Date }>(
  booking: T,
  now = new Date()
): T {
  if (booking.status === "CANCELLED") return booking;
  const status: BookingStatus = now < booking.startTime ? "UPCOMING" : now <= booking.endTime ? "ONGOING" : "COMPLETED";
  return { ...booking, status };
}

async function findOverlap(assetId: string, startTime: Date, endTime: Date, excludeId?: string) {
  return prisma.booking.findFirst({
    where: {
      assetId,
      ...(excludeId && { id: { not: excludeId } }),
      status: { not: "CANCELLED" },
      startTime: { lt: endTime },
      endTime: { gt: startTime },
    },
    include: { bookedBy: { select: { name: true } } },
  });
}

function overlapMessage(overlap: { startTime: Date; endTime: Date; bookedBy: { name: string } }) {
  const fmt = (d: Date) => d.toLocaleString();
  return `This slot overlaps with an existing booking by ${overlap.bookedBy.name} (${fmt(overlap.startTime)} – ${fmt(
    overlap.endTime
  )})`;
}

// Booking visibility is deliberately not role-scoped — everyone needs to see
// a resource's existing bookings to schedule around them, which is the whole
// point of a shared-resource calendar.
export const listBookings = asyncHandler(async (req: Request, res: Response) => {
  const query = listBookingsQuerySchema.parse(req.query);
  const where: Prisma.BookingWhereInput = {
    ...(query.assetId && { assetId: query.assetId }),
    ...(query.from && { endTime: { gte: query.from } }),
    ...(query.to && { startTime: { lte: query.to } }),
  };

  const bookings = await prisma.booking.findMany({ where, select: bookingSelect, orderBy: { startTime: "asc" } });
  res.json({ bookings: bookings.map((b) => withComputedStatus(b)) });
});

export const createBooking = asyncHandler(async (req: Request, res: Response) => {
  const input = createBookingSchema.parse(req.body);

  const asset = await prisma.asset.findUnique({ where: { id: input.assetId } });
  if (!asset) throw new AppError(404, "Asset not found");
  if (!asset.isBookable) throw new AppError(400, "This asset is not marked as a shared/bookable resource");
  if (input.startTime < new Date()) throw new AppError(400, "Cannot book a time slot in the past");

  const overlap = await findOverlap(asset.id, input.startTime, input.endTime);
  if (overlap) throw new AppError(409, overlapMessage(overlap));

  const booking = await prisma.booking.create({
    data: {
      assetId: asset.id,
      bookedById: req.user!.id,
      purpose: input.purpose,
      startTime: input.startTime,
      endTime: input.endTime,
    },
    select: bookingSelect,
  });

  await logActivity({
    userId: req.user!.id,
    action: "CREATE_BOOKING",
    entityType: "Booking",
    entityId: booking.id,
    metadata: { assetTag: asset.assetTag, startTime: booking.startTime, endTime: booking.endTime },
  });
  await notify({
    userId: booking.bookedById,
    type: "BOOKING_CONFIRMED",
    message: `Your booking for ${asset.name} (${asset.assetTag}) on ${booking.startTime.toLocaleString()} is confirmed`,
    relatedEntityType: "Booking",
    relatedEntityId: booking.id,
  });

  res.status(201).json({ booking: withComputedStatus(booking) });
});

function assertCanModify(req: Request, booking: BookingRow) {
  const { role, id } = req.user!;
  const isOwner = booking.bookedById === id;
  if (!isOwner && !PRIVILEGED_ROLES.includes(role)) {
    throw new AppError(403, "You can only modify your own bookings");
  }
}

export const cancelBooking = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const booking = await prisma.booking.findUnique({ where: { id }, select: bookingSelect });
  if (!booking) throw new AppError(404, "Booking not found");
  if (booking.status === "CANCELLED") throw new AppError(400, "Booking is already cancelled");

  assertCanModify(req, booking);

  const updated = await prisma.booking.update({ where: { id }, data: { status: "CANCELLED" }, select: bookingSelect });

  await logActivity({
    userId: req.user!.id,
    action: "UPDATE_BOOKING",
    entityType: "Booking",
    entityId: updated.id,
    metadata: { assetTag: updated.asset.assetTag, change: "cancelled" },
  });
  await notify({
    userId: updated.bookedById,
    type: "BOOKING_CANCELLED",
    message: `Your booking for ${updated.asset.name} (${updated.asset.assetTag}) was cancelled`,
    relatedEntityType: "Booking",
    relatedEntityId: updated.id,
  });

  res.json({ booking: withComputedStatus(updated) });
});

export const rescheduleBooking = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const input = rescheduleBookingSchema.parse(req.body);

  const booking = await prisma.booking.findUnique({ where: { id }, select: bookingSelect });
  if (!booking) throw new AppError(404, "Booking not found");

  const currentStatus = withComputedStatus(booking).status;
  if (currentStatus === "CANCELLED" || currentStatus === "COMPLETED") {
    throw new AppError(400, `Cannot reschedule a ${currentStatus.toLowerCase()} booking`);
  }
  assertCanModify(req, booking);

  if (input.startTime < new Date()) throw new AppError(400, "Cannot book a time slot in the past");

  const overlap = await findOverlap(booking.assetId, input.startTime, input.endTime, id);
  if (overlap) throw new AppError(409, overlapMessage(overlap));

  const updated = await prisma.booking.update({
    where: { id },
    data: { startTime: input.startTime, endTime: input.endTime },
    select: bookingSelect,
  });
  await logActivity({
    userId: req.user!.id,
    action: "UPDATE_BOOKING",
    entityType: "Booking",
    entityId: updated.id,
    metadata: { assetTag: updated.asset.assetTag, change: "rescheduled" },
  });
  res.json({ booking: withComputedStatus(updated) });
});
