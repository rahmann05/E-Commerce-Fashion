import prisma from "../db/client";

export class ReviewController {
  static async submitReview(params: { customerId: string, productId: string, orderId: string, rating: number, comment?: string }) {
    const { customerId, productId, orderId, rating, comment } = params;

    if (rating < 1 || rating > 5) {
      throw new Error("Rating must be between 1-5");
    }

    // 1. Check existing
    const existing = await prisma.review.findFirst({
      where: { customerId, productId, orderId }
    });
    if (existing) throw new Error("Already reviewed");

    // 2. Save Review
    const review = await prisma.review.create({
      data: {
        customerId,
        productId,
        orderId,
        rating,
        comment: comment || ""
      }
    });

    // 3. Update Product Rating
    const allReviews = await prisma.review.findMany({
      where: { productId },
      select: { rating: true }
    });

    const ratings = allReviews.map(r => r.rating);
    const totalRating = ratings.reduce((acc, curr) => acc + curr, 0);
    const averageRating = totalRating / ratings.length;

    await prisma.product.update({
      where: { id: productId },
      data: { 
        rating: averageRating,
        totalReviews: allReviews.length
      }
    });

    return {
      review,
      newAverageRating: Number(averageRating.toFixed(2))
    };
  }

  static async getReviewsByProductId(productId: string) {
    const reviews = await prisma.review.findMany({
      where: { productId },
      orderBy: { createdAt: "desc" }
    });

    const total = reviews.length;
    const average = total === 0
      ? 0
      : reviews.reduce((acc, review) => acc + review.rating, 0) / total;

    const formatted = reviews.map((review) => ({
      id: review.id,
      rating: review.rating,
      comment: review.comment,
      createdAt: review.createdAt.toISOString(),
      user: {
        name: null,
        image: null
      }
    }));

    return {
      reviews: formatted,
      summary: {
        total,
        average: Number(average.toFixed(2))
      }
    };
  }
}
