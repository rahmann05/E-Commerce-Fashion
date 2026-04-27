import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import "dotenv/config";

const connectionString = process.env.DATABASE_URL;
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🚀 Starting seeding core-commerce-api...");

  // 1. Clean existing data
  await prisma.cartItem.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.review.deleteMany();
  await prisma.wishlistItem.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();

  // 2. Create Categories
  const tees = await prisma.category.create({
    data: { name: "Tees", image: "/images/cat-tees.png" },
  });
  const jeans = await prisma.category.create({
    data: { name: "Jeans", image: "/images/cat-jeans.png" },
  });

  // 3. Create Products with Correlated Stocks
  const products = [
    {
      name: "Essential White Tee",
      slug: "essential-white-tee",
      description: "Premium cotton tee for everyday comfort.",
      price: 159000,
      categoryId: tees.id,
      sizeOptions: ["S", "M", "L", "XL"],
      sizeStocks: [10, 25, 15, 5],
      images: ["/images/tees-white-1.png", "/images/tees-white-2.png"],
      reviewRatings: [5, 4, 5],
      reviewComments: ["Best quality!", "Nice fit.", "Very comfortable."],
    },
    {
      name: "Raw Denim Slim Fit",
      slug: "raw-denim-slim",
      description: "14oz raw indigo denim with a modern slim silhouette.",
      price: 899000,
      categoryId: jeans.id,
      sizeOptions: ["28", "30", "32", "34"],
      sizeStocks: [12, 21, 18, 10],
      images: ["/images/jeans-raw-1.png"],
      reviewRatings: [5, 5],
      reviewComments: ["Incredible fade potential.", "Top tier denim."],
    },
  ];

  for (const p of products) {
    const totalStock = p.sizeStocks.reduce((acc, curr) => acc + curr, 0);
    const avgRating = p.reviewRatings.reduce((acc, curr) => acc + curr, 0) / p.reviewRatings.length;

    await prisma.product.create({
      data: {
        name: p.name,
        slug: p.slug,
        description: p.description,
        price: p.price,
        categoryId: p.categoryId,
        sizeOptions: p.sizeOptions,
        sizeStocks: p.sizeStocks,
        stock: totalStock,
        images: p.images,
        rating: avgRating,
        reviewRatings: p.reviewRatings,
        reviewComments: p.reviewComments,
        inStock: totalStock > 0,
        // Create variants for relational compatibility
        variants: {
          create: p.sizeOptions.map((size, index) => ({
            size,
            stock: p.sizeStocks[index],
          })),
        },
      },
    });
  }

  console.log("✅ Seeding completed successfully.");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
