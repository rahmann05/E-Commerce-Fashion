import { Request, Response, NextFunction } from 'express';
import { ReviewService } from '../services/review.service';

export class ReviewController {
  static async submitReview(req: any, res: Response, next: NextFunction) {
    try { res.json(await ReviewService.submitReview({ customerId: req.user.id, ...req.body })); } catch(e) { next(e); }
  }
  static async getReviewsByProductId(req: Request, res: Response, next: NextFunction) {
    try { res.json(await ReviewService.getReviewsByProductId(req.params.id)); } catch(e) { next(e); }
  }
}
