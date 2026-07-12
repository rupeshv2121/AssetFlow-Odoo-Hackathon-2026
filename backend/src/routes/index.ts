import { Router } from "express";
import authRoutes from "@/routes/auth.routes";
import departmentRoutes from "@/routes/department.routes";
import categoryRoutes from "@/routes/category.routes";
import employeeRoutes from "@/routes/employee.routes";
import assetRoutes from "@/routes/asset.routes";
import dashboardRoutes from "@/routes/dashboard.routes";
import allocationRoutes from "@/routes/allocation.routes";
import allocationRequestRoutes from "@/routes/allocationRequest.routes";
import bookingRoutes from "@/routes/booking.routes";
import maintenanceRoutes from "@/routes/maintenance.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/departments", departmentRoutes);
router.use("/categories", categoryRoutes);
router.use("/employees", employeeRoutes);
router.use("/assets", assetRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/allocations", allocationRoutes);
router.use("/allocation-requests", allocationRequestRoutes);
router.use("/bookings", bookingRoutes);
router.use("/maintenance", maintenanceRoutes);

// Other devs: mount your module's router here, e.g.
// router.use("/audits", auditRoutes);

export default router;
