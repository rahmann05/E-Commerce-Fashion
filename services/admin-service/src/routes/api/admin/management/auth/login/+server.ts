import { json } from '@sveltejs/kit';
import { prisma } from '@infrastructure/database/prisma';
import { verifyPassword } from '@application/auth/password';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'novure-super-secret-key-2026';

export async function POST({ request, cookies }) {
    const { email, password } = await request.json();
    
    const admin = await prisma.adminUser.findUnique({ where: { email } });
    if (!admin || !(await verifyPassword(password, admin.password))) {
        return json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const token = jwt.sign(
        { id: admin.id, role: admin.role },
        JWT_SECRET,
        { expiresIn: '7d' }
    );

    cookies.set('novure_jwt', token, {
        path: '/',
        httpOnly: true,
        secure: false, // Development
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7 // 1 week
    });

    // Also clear the old session cookie if it exists
    cookies.delete('admin_session', { path: '/' });

    return json({ 
        success: true, 
        user: { id: admin.id, email: admin.email, role: admin.role },
        token // Returning token as well for flexibility
    });
}