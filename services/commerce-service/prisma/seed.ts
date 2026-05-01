import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Starting seed...");

  // 1. Cleanup
  await prisma.productVariant.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();

  // 2. Categories
  const categories = [
    { name: "Tees", slug: "tees" },
    { name: "Jeans", slug: "jeans" },
    { name: "Outerwear", slug: "outerwear" },
    { name: "Accessories", slug: "accessories" },
    { name: "Editorial", slug: "editorial" },
  ];

  const createdCategories: Record<string, any> = {};
  for (const cat of categories) {
    createdCategories[cat.slug] = await prisma.category.create({
      data: cat,
    });
  }

  // 3. Products
  const products = [
    // TEES
    { name: "Essential White Tee", slug: "essential-white-tee", description: "Premium cotton classic white tee.", price: 150000, image: ["tees1.png"], stock: 100, categoryId: createdCategories.tees.id, isFeatured: true },
    { name: "Earth Brown Tee", slug: "earth-brown-tee", description: "Earthy brown cotton tee.", price: 150000, image: ["tees2.png"], stock: 80, categoryId: createdCategories.tees.id },
    { name: "Sage Olive Tee", slug: "sage-olive-tee", description: "Soft olive green tee.", price: 150000, image: ["tees3.png"], stock: 85, categoryId: createdCategories.tees.id },
    { name: "Minimalist Grey Tee", slug: "minimalist-grey-tee", description: "Versatile grey tee.", price: 150000, image: ["tees4.png"], stock: 90, categoryId: createdCategories.tees.id },
    { name: "Midnight Black Tee", slug: "midnight-black-tee", description: "Classic black essential tee.", price: 150000, image: ["tees5.png"], stock: 120, categoryId: createdCategories.tees.id },
    { name: "Vintage Cream Tee", slug: "vintage-cream-tee", description: "Vintage cream colored tee.", price: 150000, image: ["tees6.png"], stock: 60, categoryId: createdCategories.tees.id },
    { name: "Forest Green Tee", slug: "forest-green-tee", description: "Deep forest green cotton tee.", price: 150000, image: ["tees7.png"], stock: 70, categoryId: createdCategories.tees.id },
    
    // JEANS
    { name: "Indigo Blue Denim", slug: "indigo-blue-denim", description: "Timeless blue denim.", price: 450000, image: ["jeans1.png"], stock: 50, categoryId: createdCategories.jeans.id },
    { name: "Obsidian Black Jeans", slug: "obsidian-black-jeans", description: "Sleek black denim.", price: 450000, image: ["jeans2.png"], stock: 60, categoryId: createdCategories.jeans.id },
    { name: "Light Ocean Jeans", slug: "light-ocean-jeans", description: "Casual light blue jeans.", price: 450000, image: ["jeans3.png"], stock: 45, categoryId: createdCategories.jeans.id },
    { name: "Deep Navy Denim", slug: "deep-navy-denim", description: "Dark indigo wash jeans.", price: 450000, image: ["jeans4.png"], stock: 55, categoryId: createdCategories.jeans.id },
    { name: "Graphite Grey Jeans", slug: "graphite-grey-jeans", description: "Modern grey denim.", price: 450000, image: ["jeans5.png"], stock: 40, categoryId: createdCategories.jeans.id },
    { name: "Raw Blue Jeans", slug: "raw-blue-jeans", description: "Deep navy blue jeans.", price: 450000, image: ["jeans6.png"], stock: 50, categoryId: createdCategories.jeans.id },

    // OUTERWEAR
    { name: "Tech Bomber Jacket", slug: "tech-bomber-jacket", description: "Water resistant tactical outerwear.", price: 850000, image: ["outerwear1.png"], stock: 30, categoryId: createdCategories.outerwear.id },
    { name: "Urban Windbreaker", slug: "urban-windbreaker", description: "Lightweight grey windbreaker.", price: 750000, image: ["outerwear2.png"], stock: 25, categoryId: createdCategories.outerwear.id },
    { name: "Classic Field Jacket", slug: "classic-field-jacket", description: "Classic military style jacket.", price: 850000, image: ["outerwear3.png"], stock: 20, categoryId: createdCategories.outerwear.id },
    { name: "Modern Parka", slug: "modern-parka", description: "Sleek navy bomber.", price: 900000, image: ["outerwear4.png"], stock: 15, categoryId: createdCategories.outerwear.id },
    { name: "Heritage Outer", slug: "heritage-outer", description: "Premium brown leather.", price: 1250000, image: ["outerwear5.png"], stock: 10, categoryId: createdCategories.outerwear.id },

    // ACCESSORIES
    { name: "Essential Watch", slug: "essential-watch", description: "Sleek matte black watch.", price: 250000, image: ["accessories1.png"], stock: 40, categoryId: createdCategories.accessories.id },
    { name: "Premium Belt", slug: "premium-belt", description: "Genuine leather belt.", price: 150000, image: ["accessories2.png"], stock: 60, categoryId: createdCategories.accessories.id },
    { name: "Chain Necklace", slug: "chain-necklace", description: "Minimalist silver chain.", price: 100000, image: ["accessories3.png"], stock: 100, categoryId: createdCategories.accessories.id },
  ];

  for (const p of products) {
    const createdProduct = await prisma.product.create({
      data: {
        ...p,
        variants: {
          create: [
            {
              sku: `${p.slug.toUpperCase()}-001`,
              name: "Standard",
              stock: p.stock,
              price: p.price,
            }
          ]
        }
      },
    });
    console.log(`Created product: ${createdProduct.name}`);
  }

  console.log("Seed finished successfully.");
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
