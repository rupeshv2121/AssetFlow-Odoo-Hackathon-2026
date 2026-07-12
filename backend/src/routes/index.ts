import { Router } from "express";
import authRoutes from "@/routes/auth.routes";
import departmentRoutes from "@/routes/department.routes";
import categoryRoutes from "@/routes/category.routes";
import employeeRoutes from "@/routes/employee.routes";
import assetRoutes from "@/routes/asset.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/departments", departmentRoutes);
router.use("/categories", categoryRoutes);
router.use("/employees", employeeRoutes);
router.use("/assets", assetRoutes);

// Other devs: mount your module's router here, e.g.
// router.use("/bookings", bookingRoutes);

export default router;
