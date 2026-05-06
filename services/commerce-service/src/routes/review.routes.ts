import { Router } from "express";
import { ReviewController } from "../controllers/review.controller";

const router = Router();

router.post("/", async (req, res) => {
  try {
    const customerId = (req.body.customerId || req.headers["x-user-id"]) as string | undefined;
    if (!customerId) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    const result = await ReviewController.submitReview({
      customerId,
      productId: req.body.productId,
      orderId: req.body.orderId,
      rating: Number(req.body.rating),
      comment: req.body.comment
    });
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
