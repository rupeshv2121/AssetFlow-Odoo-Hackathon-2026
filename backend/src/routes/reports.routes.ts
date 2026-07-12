import { Router } from "express";
import { getReports } from "@/controllers/reports.controller";
import { authenticate, authorize } from "@/middleware/auth.middleware";

const router = Router();

router.get("/", authenticate, authorize("ADMIN", "ASSET_MANAGER", "DEPARTMENT_HEAD"), getReports);

export default router;
