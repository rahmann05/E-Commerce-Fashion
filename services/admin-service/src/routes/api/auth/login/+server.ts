import { json } from '@sveltejs/kit';
import { prisma } from '@infrastructure/database/prisma';
import { verifyPassword } from '@application/auth/password';

export async function POST({ request, cookies }) {
    const { email, password } = await request.json();
    
    const admin = await prisma.adminUser.findUnique({ where: { email } });
    if (!admin || !(await verifyPassword(password, admin.password))) {
        return json({ error: 'Invalid credentials' }, { status: 401 });
    }

    cookies.set('admin_session', admin.id, {
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 7 // 1 week
    });

    return json({ success: true, user: { id: admin.id, email: admin.email, role: admin.role } });
}