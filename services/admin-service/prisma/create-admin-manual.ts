import "dotenv/config";
import { prisma } from '../src/infrastructure/database/prisma';
import bcrypt from "bcryptjs";

async function main() {
  const email = 'admin@gmail.com';
  const password = 'admin123';
  const hashedPassword = await bcrypt.hash(password, 10);

  const admin = await prisma.adminUser.upsert({
    where: { email },
    update: {
        password: hashedPassword,
        name: 'Admin'
    },
    create: {
      email,
      name: 'Admin',
      password: hashedPassword,
      role: 'SUPER_ADMIN',
    },
  });

  console.log('Admin account created/updated:', admin.email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
