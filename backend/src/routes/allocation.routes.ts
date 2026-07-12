import { Router } from "express";
import { listAllocations, createAllocation, requestReturn, markReturned } from "@/controllers/allocation.controller";
import { authenticate, authorize } from "@/middleware/auth.middleware";

const router = Router();

router.use(authenticate);

router.get("/", listAllocations);
router.post("/", authorize("ADMIN", "ASSET_MANAGER"), createAllocation);
router.post("/:id/request-return", requestReturn);
router.patch("/:id/return", authorize("ADMIN", "ASSET_MANAGER"), markReturned);

export default router;
