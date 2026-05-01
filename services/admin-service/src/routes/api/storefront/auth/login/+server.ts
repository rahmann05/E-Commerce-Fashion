import { json } from '@sveltejs/kit';
import { prisma } from '@infrastructure/database/prisma';
import { verifyPassword } from '@application/auth/password';

export async function POST({ request, cookies }) {
    try {
        const { email, password } = await request.json();

        if (!email || !password) {
            return json({ success: false, data: null, message: 'Email and password are required' }, { status: 400 });
        }

        const customer = await prisma.customer.findUnique({ where: { email } });
        if (!customer || !(await verifyPassword(password, customer.password))) {
            return json({ success: false, data: null, message: 'Invalid credentials' }, { status: 401 });
        }

        cookies.set('novure_uid', customer.id, {
            path: '/',
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 60 * 24 * 7, // 1 week
            sameSite: 'lax'
        });

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password: _password, ...customerData } = customer;

        return json({
            success: true,
            data: customerData,
            message: 'Login successful'
        });
    } catch (error) {
        console.error('Login error:', error);
        return json({ success: false, data: null, message: (error as Error).message || 'Internal server error' }, { status: 500 });
    }
}
