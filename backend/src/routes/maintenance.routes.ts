import { Router } from "express";
import {
  listMaintenanceRequests,
  createMaintenanceRequest,
  approveMaintenanceRequest,
  rejectMaintenanceRequest,
  assignTechnician,
  startMaintenanceWork,
  resolveMaintenanceRequest,
} from "@/controllers/maintenance.controller";
import { authenticate, authorize } from "@/middleware/auth.middleware";

const router = Router();

router.use(authenticate);

router.get("/", listMaintenanceRequests);
router.post("/", createMaintenanceRequest);
router.patch("/:id/approve", authorize("ADMIN", "ASSET_MANAGER"), approveMaintenanceRequest);
router.patch("/:id/reject", authorize("ADMIN", "ASSET_MANAGER"), rejectMaintenanceRequest);
router.patch("/:id/assign-technician", authorize("ADMIN", "ASSET_MANAGER"), assignTechnician);
router.patch("/:id/start", authorize("ADMIN", "ASSET_MANAGER"), startMaintenanceWork);
router.patch("/:id/resolve", authorize("ADMIN", "ASSET_MANAGER"), resolveMaintenanceRequest);

export default router;
