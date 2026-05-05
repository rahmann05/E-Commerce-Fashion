import "dotenv/config";
import { prisma } from '../src/infrastructure/database/prisma';
import { hashPassword } from '../src/application/auth/password';

async function main() {
  const password = await hashPassword('password');
  const admin = await prisma.adminUser.upsert({
    where: { email: 'admin@novure.com' },
    update: { password },
    create: {
      email: 'admin@novure.com',
      name: 'Super Admin',
      password: password,
      role: 'SUPER_ADMIN',
    },
  });
  console.log('Super Admin created:', admin.email);
  
  const adminAlt = await prisma.adminUser.upsert({
    where: { email: 'admin@gmail.com' },
    update: { password },
    create: {
      email: 'admin@gmail.com',
      name: 'Admin Alternative',
      password: password,
      role: 'SUPER_ADMIN',
    },
  });
  console.log('Alternative Admin created:', adminAlt.email);

  // Add standard Indonesian carriers
  await prisma.shippingCarrier.createMany({
    data: [
      { name: "JNE (Jalur Nugraha Ekakurir)", code: "JNE" },
      { name: "J&T Express", code: "JNT" },
      { name: "SiCepat Ekspres", code: "SICEPAT" },
      { name: "Shopee Express", code: "SPX" },
      { name: "GoSend", code: "GOSEND" },
      { name: "GrabExpress", code: "GRAB" }
    ],
    skipDuplicates: true
  });
  console.log('Shipping carriers seeded');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
