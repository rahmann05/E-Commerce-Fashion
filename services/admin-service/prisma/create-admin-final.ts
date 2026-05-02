import { PrismaClient } from '@prisma/client';
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

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
