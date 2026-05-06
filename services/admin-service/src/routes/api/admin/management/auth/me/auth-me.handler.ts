import { json } from '@sveltejs/kit';
import { prisma } from '@infrastructure/database/prisma';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'novure-super-secret-key-2026';

export async function GET({ cookies }) {
  const token = cookies.get('novure_jwt');
  if (!token) return json({ success: false, error: 'Unauthorized' }, { status: 401 });

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; role: string };
    const admin = await prisma.adminUser.findUnique({ where: { id: decoded.id } });

    if (!admin) return json({ success: false, error: 'Unauthorized' }, { status: 401 });

    return json({
      success: true,
      data: { id: admin.id, email: admin.email, role: admin.role, name: admin.name }
    });
  } catch (err) {
    return json({ success: false, error: 'Invalid token' }, { status: 401 });
  }
}
