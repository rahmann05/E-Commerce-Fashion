import { Router } from "express";
import { CategoryController } from "../controllers/category.controller";

const router = Router();

router.get("/", CategoryController.getCategories as any);
router.get("/:id", CategoryController.getCategoryById as any);

export default router;