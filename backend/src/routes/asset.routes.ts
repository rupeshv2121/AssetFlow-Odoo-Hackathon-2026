import { Router } from "express";
import {
  listAssets,
  getAsset,
  createAsset,
  updateAsset,
  updateAssetStatus,
} from "@/controllers/asset.controller";
import { authenticate, authorize } from "@/middleware/auth.middleware";

const router = Router();

router.use(authenticate);

router.get("/", listAssets);
router.get("/:id", getAsset);
router.post("/", authorize("ADMIN", "ASSET_MANAGER"), createAsset);
router.patch("/:id", authorize("ADMIN", "ASSET_MANAGER"), updateAsset);
router.patch("/:id/status", authorize("ADMIN", "ASSET_MANAGER"), updateAssetStatus);

export default router;
