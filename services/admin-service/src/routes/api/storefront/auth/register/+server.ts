import { json } from '@sveltejs/kit';
import { prisma } from '@infrastructure/database/prisma';
import { hashPassword } from '@application/auth/password';

export async function POST({ request }) {
    try {
        const { email, password, name, phone } = await request.json();

        if (!email || !password) {
            return json({ success: false, data: null, message: 'Email and password are required' }, { status: 400 });
        }

        const existingCustomer = await prisma.customer.findUnique({ where: { email } });
        if (existingCustomer) {
            return json({ success: false, data: null, message: 'Customer with this email already exists' }, { status: 400 });
        }

        const hashedPassword = await hashPassword(password);

        const customer = await prisma.customer.create({
            data: {
                email,
                password: hashedPassword,
                name,
                phone
            }
        });

        const { password: _, ...customerData } = customer;

        return json({
            success: true,
            data: customerData,
            message: 'Registration successful'
        }, { status: 201 });
    } catch (error: any) {
        console.error('Registration error:', error);
        return json({ success: false, data: null, message: error.message || 'Internal server error' }, { status: 500 });
    }
}
