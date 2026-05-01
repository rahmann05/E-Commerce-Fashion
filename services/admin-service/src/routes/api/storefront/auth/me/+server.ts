import { json } from '@sveltejs/kit';
import { prisma } from '@infrastructure/database/prisma';

export async function GET({ cookies }) {
    try {
        const customerId = cookies.get('novure_uid');

        if (!customerId) {
            return json({ success: false, data: null, message: 'Not authenticated' }, { status: 401 });
        }

        const customer = await prisma.customer.findUnique({
            where: { id: customerId }
        });

        if (!customer) {
            return json({ success: false, data: null, message: 'Customer not found' }, { status: 404 });
        }

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password: _password, ...customerData } = customer;

        return json({
            success: true,
            data: customerData,
            message: 'User retrieved successfully'
        });
    } catch (error) {
        console.error('Me error:', error);
        return json({ success: false, data: null, message: (error as Error).message || 'Internal server error' }, { status: 500 });
    }
}
