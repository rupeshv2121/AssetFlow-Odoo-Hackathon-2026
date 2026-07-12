import { Router } from "express";
import {
  listAllocationRequests,
  createAllocationRequest,
  approveAllocationRequest,
  rejectAllocationRequest,
} from "@/controllers/allocationRequest.controller";
import { authenticate, authorize } from "@/middleware/auth.middleware";

const router = Router();

router.use(authenticate);

router.get("/", listAllocationRequests);
router.post("/", createAllocationRequest);
router.patch("/:id/approve", authorize("ADMIN", "ASSET_MANAGER", "DEPARTMENT_HEAD"), approveAllocationRequest);
router.patch("/:id/reject", authorize("ADMIN", "ASSET_MANAGER", "DEPARTMENT_HEAD"), rejectAllocationRequest);

export default router;
