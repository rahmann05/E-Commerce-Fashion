import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import "dotenv/config";

const connectionString = "postgresql://postgres:AwasLupaPassword123%21@db.ghdadhlyhzdkrjlurifj.supabase.co:5432/postgres";
const pool = new pg.Pool({ 
  connectionString,
  ssl: { rejectUnauthorized: false } 
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🚀 Starting RE-SEEDING core-commerce-api (1 Product per Image)...");

  // 1. Clean existing data
  await prisma.cartItem.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.review.deleteMany();
  await prisma.wishlistItem.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();

  // 2. Create Categories
  const catTees = await prisma.category.create({
    data: { name: "Tees", image: "tees1.png" },
  });
  const catJeans = await prisma.category.create({
    data: { name: "Jeans", image: "jeans1.png" },
  });
  const catOuterwear = await prisma.category.create({
    data: { name: "Outerwear", image: "outerwear1.png" },
  });
  const catAccessories = await prisma.category.create({
    data: { name: "Accessories", image: "accessories1.png" },
  });
  const catEditorial = await prisma.category.create({
    data: { name: "Editorial", image: "model1.jpg" },
  });

  const categoryMap = {
    tees: catTees,
    jeans: catJeans,
    outerwear: catOuterwear,
    accessories: catAccessories,
    model: catEditorial,
  };

  // 3. List of all images from the bucket
  const imageFiles = [
    "accessories1.png", "accessories2.png", "accessories3.png",
    "jeans1.png", "jeans2.png", "jeans3.png", "jeans4.png", "jeans5.png", "jeans6.png",
    "model1.jpg", "model2.jpg", "model3.jpg", "model4.png",
    "outerwear1.png", "outerwear2.png", "outerwear3.png", "outerwear4.png", "outerwear5.png",
    "tees1.png", "tees2.png", "tees3.png", "tees4.png", "tees5.png", "tees6.png", "tees7.png"
  ];

  const getBaseName = (filename: string) => {
    if (filename.startsWith("tees")) return "tees";
    if (filename.startsWith("jeans")) return "jeans";
    if (filename.startsWith("outerwear")) return "outerwear";
    if (filename.startsWith("accessories")) return "accessories";
    if (filename.startsWith("model")) return "model";
    return "other";
  };

  const getPrettyName = (filename: string) => {
    const base = getBaseName(filename);
    const num = filename.match(/\d+/)?.[0] || "01";
    
    switch (base) {
      case "tees": return `Essential Boxy Tee ${num}`;
      case "jeans": return `Relaxed Wide Denim ${num}`;
      case "outerwear": return `Canvas Field Jacket ${num}`;
      case "accessories": return `Technical Sling Bag ${num}`;
      case "model": return `Signature Editorial ${num}`;
      default: return `Product ${num}`;
    }
  };

  const getDescription = (base: string) => {
    switch (base) {
      case "tees": return "Premium 240gsm cotton with a vintage wash and boxy silhouette.";
      case "jeans": return "14oz raw selvedge denim, cut for a contemporary baggy fit.";
      case "outerwear": return "Water-resistant canvas shell with quilted lining for modular warmth.";
      case "accessories": return "Nylon ripstop construction with weather-sealed zippers.";
      case "model": return "Exclusive runway piece from our latest seasonal collection.";
      default: return "Limited edition piece from our core collection.";
    }
  };

  const getPrice = (base: string) => {
    switch (base) {
      case "tees": return 250000;
      case "jeans": return 890000;
      case "outerwear": return 1250000;
      case "accessories": return 450000;
      case "model": return 2500000;
      default: return 500000;
    }
  };

  const getSizeOptions = (base: string) => {
    if (base === "accessories") return ["One Size"];
    if (base === "jeans") return ["28", "30", "32", "34", "36"];
    return ["S", "M", "L", "XL", "XXL"];
  };

  for (const filename of imageFiles) {
    const base = getBaseName(filename);
    const category = categoryMap[base as keyof typeof categoryMap] || catTees;
    const name = getPrettyName(filename);
    const slug = filename.replace(/\.(png|jpg|jpeg)$/, "").replace(/\s+/g, "-").toLowerCase();
    const price = getPrice(base);
    const sizeOptions = getSizeOptions(base);
    const sizeStocks = sizeOptions.map(() => Math.floor(Math.random() * 50) + 10);
    const totalStock = sizeStocks.reduce((a, b) => a + b, 0);

    await prisma.product.create({
      data: {
        name,
        slug,
        description: getDescription(base),
        price,
        categoryId: category.id,
        sizeOptions,
        sizeStocks,
        stock: totalStock,
        images: [filename],
        rating: 5.0,
        inStock: true,
        variants: {
          create: sizeOptions.map((size, index) => ({
            size,
            stock: sizeStocks[index],
          })),
        },
      },
    });
    console.log(`✅ Created product: ${name} (${filename})`);
  }

  console.log("✨ RE-SEEDING completed successfully.");
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
