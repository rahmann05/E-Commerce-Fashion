import { Router } from "express";
import { ProductController } from "../controllers/product.controller";
import { ReviewController } from "../controllers/review.controller";

const router = Router();

// Storefront routes
router.get("/", async (req, res) => {
  try {
    const { categoryId, categoryName, q, ids } = req.query;
    const result = await ProductController.getProducts({
      categoryId: categoryId as string,
      categoryName: categoryName as string,
      query: q as string,
      idsParam: ids as string
    });
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get("/:id/reviews", async (req, res) => {
  try {
    const result = await ReviewController.getReviewsByProductId(req.params.id);
    res.json({ success: true, ...result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Admin routes
router.get("/admin", async (req, res) => {
  try {
    const { q, categoryId } = req.query;
    const result = await ProductController.getAdminProducts({
      q: q as string,
      categoryId: categoryId as string
    });
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get("/admin/:id", async (req, res) => {
  try {
    const result = await ProductController.getProductByIdAdmin(req.params.id);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.patch("/admin/:id", async (req, res) => {
  try {
    const result = await ProductController.updateProduct(req.params.id, req.body);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete("/admin/:id", async (req, res) => {
  try {
    const result = await ProductController.deleteProduct(req.params.id);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

import { Router } from "express";
import { ProductController } from "../controllers/product.controller";
import { ReviewController } from "../controllers/review.controller";

const router = Router();

// Storefront routes
router.get("/", ProductController.getProducts);
router.get("/:id/reviews", async (req, res) => {
  try {
    const result = await ReviewController.getReviewsByProductId(req.params.id);
    res.json({ success: true, ...result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});
router.get("/:id", ProductController.getProductById);

export default router;
