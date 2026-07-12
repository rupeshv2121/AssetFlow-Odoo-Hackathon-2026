import { Router } from "express";
import { listCategories, createCategory, updateCategory } from "@/controllers/category.controller";
import { authenticate, authorize } from "@/middleware/auth.middleware";

const router = Router();

router.use(authenticate);

router.get("/", listCategories);
router.post("/", authorize("ADMIN"), createCategory);
router.patch("/:id", authorize("ADMIN"), updateCategory);

export default router;
