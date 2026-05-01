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
      // TEES
      { name: "White Essential Tee", slug: "white-essential-tee", description: "Premium cotton classic white tee.", price: 150000, image: ["tees1.png"], stock: 100, categoryId: createdCategories.tees.id, isFeatured: true },
      { name: "Brown Earth Tee", slug: "brown-earth-tee", description: "Earthy brown cotton tee.", price: 150000, image: ["tees2.png"], stock: 80, categoryId: createdCategories.tees.id },
      { name: "Olive Green Tee", slug: "olive-green-tee", description: "Soft olive green tee.", price: 150000, image: ["tees3.png"], stock: 85, categoryId: createdCategories.tees.id },
      { name: "Grey Minimal Tee", slug: "grey-minimal-tee", description: "Versatile grey tee.", price: 150000, image: ["tees4.png"], stock: 90, categoryId: createdCategories.tees.id },
      { name: "Midnight Black Tee", slug: "midnight-black-tee", description: "Classic black essential tee.", price: 150000, image: ["tees5.png"], stock: 120, categoryId: createdCategories.tees.id },
      { name: "Cream Vintage Tee", slug: "cream-vintage-tee", description: "Vintage cream colored tee.", price: 150000, image: ["tees6.png"], stock: 60, categoryId: createdCategories.tees.id },
      { name: "Forest Green Tee", slug: "forest-green-tee", description: "Deep forest green cotton tee.", price: 150000, image: ["tees7.png"], stock: 70, categoryId: createdCategories.tees.id },

      // JEANS
      { name: "Classic Blue Jeans", slug: "classic-blue-jeans", description: "Timeless blue denim.", price: 450000, image: ["jeans1.png"], stock: 50, categoryId: createdCategories.jeans.id },
      { name: "Pitch Black Jeans", slug: "pitch-black-jeans", description: "Sleek black denim.", price: 450000, image: ["jeans2.png"], stock: 60, categoryId: createdCategories.jeans.id },
      { name: "Light Wash Jeans", slug: "light-wash-jeans", description: "Casual light blue jeans.", price: 450000, image: ["jeans3.png"], stock: 45, categoryId: createdCategories.jeans.id },
      { name: "Deep Indigo Jeans", slug: "deep-indigo-jeans", description: "Dark indigo wash jeans.", price: 450000, image: ["jeans4.png"], stock: 55, categoryId: createdCategories.jeans.id },
      { name: "Charcoal Grey Jeans", slug: "charcoal-grey-jeans", description: "Modern grey denim.", price: 450000, image: ["jeans5.png"], stock: 40, categoryId: createdCategories.jeans.id },
      { name: "Navy Blue Jeans", slug: "navy-blue-jeans", description: "Deep navy blue jeans.", price: 450000, image: ["jeans6.png"], stock: 50, categoryId: createdCategories.jeans.id },

      // OUTERWEAR
      { name: "Black Tech Jacket", slug: "black-tech-jacket", description: "Water resistant tactical outerwear.", price: 850000, image: ["outerwear1.png"], stock: 25, categoryId: createdCategories.outerwear.id, isFeatured: true },
      { name: "Grey Urban Windbreaker", slug: "grey-urban-windbreaker", description: "Lightweight grey windbreaker.", price: 750000, image: ["outerwear2.png"], stock: 30, categoryId: createdCategories.outerwear.id },
      { name: "Olive Field Jacket", slug: "olive-field-jacket", description: "Classic military style jacket.", price: 850000, image: ["outerwear3.png"], stock: 20, categoryId: createdCategories.outerwear.id },
      { name: "Navy Bomber Jacket", slug: "navy-bomber-jacket", description: "Sleek navy bomber.", price: 900000, image: ["outerwear4.png"], stock: 15, categoryId: createdCategories.outerwear.id },
      { name: "Brown Leather Jacket", slug: "brown-leather-jacket", description: "Premium brown leather.", price: 1250000, image: ["outerwear5.png"], stock: 10, categoryId: createdCategories.outerwear.id },

      // ACCESSORIES
      { name: "Black Minimalist Watch", slug: "black-minimalist-watch", description: "Sleek matte black watch.", price: 250000, image: ["accessories1.png"], stock: 40, categoryId: createdCategories.accessories.id },
      { name: "Classic Leather Belt", slug: "classic-leather-belt", description: "Genuine brown leather belt.", price: 150000, image: ["accessories2.png"], stock: 60, categoryId: createdCategories.accessories.id },
      { name: "Silver Chain Necklace", slug: "silver-chain-necklace", description: "Minimalist silver chain.", price: 100000, image: ["accessories3.png"], stock: 100, categoryId: createdCategories.accessories.id },
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

    console.log("Seeding completed successfully.");
  } catch (error) {
    console.error("Seeding failed:", error);
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
