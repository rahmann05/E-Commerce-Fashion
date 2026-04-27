import 'dotenv/config'
import prisma from '../src/backend/prisma/client'
async function main() {
  const orders = await prisma.order.findMany({ orderBy: { createdAt: 'desc' }, take: 2, include: { items: true, user: { include: { addresses: true } } } });
  console.dir(orders, { depth: null });
}
main()
