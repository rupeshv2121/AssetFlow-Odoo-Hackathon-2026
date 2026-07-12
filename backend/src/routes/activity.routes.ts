import { Router } from "express";
import { authenticate } from "@/middleware/auth.middleware";
import { getActivityCenter, markAllNotificationsRead, markNotificationRead } from "@/controllers/activity.controller";

const router = Router();

router.use(authenticate);

router.get("/", getActivityCenter);
router.patch("/notifications/read-all", markAllNotificationsRead);
router.patch("/notifications/:id/read", markNotificationRead);

export default router;