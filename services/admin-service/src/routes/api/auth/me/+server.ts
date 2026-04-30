import { json } from '@sveltejs/kit';
import { prisma } from '@infrastructure/database/prisma';

export async function GET({ cookies }) {
    const adminId = cookies.get('admin_session');
    if (!adminId) return json({ error: 'Unauthorized' }, { status: 401 });
    
    const admin = await prisma.adminUser.findUnique({ where: { id: adminId } });
    if (!admin) return json({ error: 'Unauthorized' }, { status: 401 });
    
    return json({ user: { id: admin.id, email: admin.email, role: admin.role, name: admin.name } });
}