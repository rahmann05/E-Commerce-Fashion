import { Router } from "express";
import { CategoryController } from "../controllers/category.controller";

const router = Router();

// Storefront routes
router.get("/", async (req, res) => {
  try {
    const result = await CategoryController.getCategories();
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const result = await CategoryController.getCategoryById(req.params.id);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
