import { Router } from "express";
import {
  listAuditCycles,
  getAuditCycle,
  createAuditCycle,
  markAuditItem,
  closeAuditCycle,
} from "@/controllers/auditCycle.controller";
import { authenticate, authorize } from "@/middleware/auth.middleware";

const router = Router();

router.use(authenticate);

router.get("/", listAuditCycles);
router.get("/:id", getAuditCycle);
router.post("/", authorize("ADMIN"), createAuditCycle);
router.patch("/:id/items/:itemId", markAuditItem);
router.patch("/:id/close", authorize("ADMIN"), closeAuditCycle);

export default router;
