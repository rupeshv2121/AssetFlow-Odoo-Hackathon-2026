import { Router } from "express";
import {
  listDepartments,
  createDepartment,
  updateDepartment,
  deactivateDepartment,
} from "@/controllers/department.controller";
import { authenticate, authorize } from "@/middleware/auth.middleware";

const router = Router();

router.use(authenticate);

router.get("/", listDepartments);
router.post("/", authorize("ADMIN"), createDepartment);
router.patch("/:id", authorize("ADMIN"), updateDepartment);
router.delete("/:id", authorize("ADMIN"), deactivateDepartment);

export default router;
