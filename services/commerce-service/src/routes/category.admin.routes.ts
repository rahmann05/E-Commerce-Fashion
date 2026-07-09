import { Router } from "express";
import { CategoryController } from "../controllers/category.controller";

const router = Router();

router.get("/", CategoryController.getCategories);
router.post("/", CategoryController.createCategory);
router.patch("/:id", CategoryController.updateCategory);
router.delete("/:id", CategoryController.deleteCategory);

export default router;