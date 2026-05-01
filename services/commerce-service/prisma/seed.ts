import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import "dotenv/config";

// Use DIRECT_URL for seeding
const connectionString = process.env.DIRECT_URL;
if (!connectionString) {
  throw new Error("DIRECT_URL is not defined in .env");
}

const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🚀 Starting RE-SEEDING core-commerce-api...");

  try {
    // 1. Clean existing data (Models that still exist in Supabase after migration)
    await prisma.review.deleteMany();
    await prisma.productVariant.deleteMany();
    await prisma.product.deleteMany();
    await prisma.category.deleteMany();
    await prisma.banner.deleteMany();
    await prisma.voucher.deleteMany();

    // 2. Create Categories
    const categories = [
      { name: "Tees", slug: "tees", image: "tees1.png" },
      { name: "Jeans", slug: "jeans", image: "jeans1.png" },
      { name: "Outerwear", slug: "outerwear", image: "outerwear1.png" },
      { name: "Accessories", slug: "accessories", image: "accessories1.png" },
      { name: "Editorial", slug: "editorial", image: "model1.jpg" },
    ];

    const createdCategories: Record<string, { id: string }> = {};
    for (const cat of categories) {
      createdCategories[cat.slug] = await prisma.category.create({ data: cat });
    }

    // 3. Create Products
    const products = [
      {
        name: "Classic White Tee",
        slug: "classic-white-tee",
        description: "Premium cotton classic white tee.",
        price: 150000,
        image: ["tees1.png"],
        stock: 100,
        categoryId: createdCategories.tees.id,
        isFeatured: true
      },
      {
        name: "Slim Fit Jeans",
        slug: "slim-fit-jeans",
        description: "Modern slim fit denim.",
        price: 450000,
        image: ["jeans1.png"],
        stock: 50,
        categoryId: createdCategories.jeans.id
      },
      {
        name: "Technical Windbreaker",
        slug: "tech-windbreaker",
        description: "Water resistant tactical outerwear.",
        price: 850000,
        image: ["outerwear1.png"],
        stock: 25,
        categoryId: createdCategories.outerwear.id,
        isFeatured: true
      }
    ];

    for (const p of products) {
      const product = await prisma.product.create({ data: p });
      
      // Create a variant for each product
      await prisma.productVariant.create({
        data: {
          productId: product.id,
          sku: `${p.slug.toUpperCase()}-001`,
          name: "Standard / Black",
          stock: p.stock
        }
      });
    }

    console.log("✅ Seeding completed successfully.");
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
