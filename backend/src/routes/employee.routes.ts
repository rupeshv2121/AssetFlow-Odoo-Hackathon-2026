import { Router } from "express";
import { listEmployees, updateEmployee, promoteEmployee } from "@/controllers/employee.controller";
import { authenticate, authorize } from "@/middleware/auth.middleware";

const router = Router();

router.use(authenticate);

router.get("/", authorize("ADMIN", "ASSET_MANAGER", "DEPARTMENT_HEAD"), listEmployees);
router.patch("/:id", authorize("ADMIN"), updateEmployee);
router.post("/:id/promote", authorize("ADMIN"), promoteEmployee);

export default router;
