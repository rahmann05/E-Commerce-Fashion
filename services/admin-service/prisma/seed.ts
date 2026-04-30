import "dotenv/config";
import { prisma } from '../src/lib/server/db';
import { hashPassword } from '../src/backend/auth/password';

async function main() {
  const password = await hashPassword('admin123');
  const admin = await prisma.adminUser.upsert({
    where: { email: 'admin@novure.com' },
    update: {},
    create: {
      email: 'admin@novure.com',
      name: 'Super Admin',
      password: password,
      role: 'SUPER_ADMIN',
    },
  });
  console.log('Super Admin created:', admin.email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
