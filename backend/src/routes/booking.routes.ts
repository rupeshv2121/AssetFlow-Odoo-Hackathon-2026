import { Router } from "express";
import { listBookings, createBooking, cancelBooking, rescheduleBooking } from "@/controllers/booking.controller";
import { authenticate } from "@/middleware/auth.middleware";

const router = Router();

router.use(authenticate);

router.get("/", listBookings);
router.post("/", createBooking);
router.patch("/:id/cancel", cancelBooking);
router.patch("/:id", rescheduleBooking);

export default router;
