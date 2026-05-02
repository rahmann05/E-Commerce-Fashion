import { prisma } from '@infrastructure/database/prisma';
import jwt from 'jsonwebtoken';
import type { Handle } from '@sveltejs/kit';

const JWT_SECRET = process.env.JWT_SECRET || 'novure-super-secret-key-2026';

export const handle: Handle = async ({ event, resolve }) => {
    const token = event.cookies.get('novure_jwt');

    if (token) {
        try {
            const decoded = jwt.verify(token, JWT_SECRET) as { id: string; role: string };
            const admin = await prisma.adminUser.findUnique({
                where: { id: decoded.id },
                select: { id: true, email: true, role: true, name: true }
            });

            if (admin) {
                event.locals.user = admin;
            } else {
                event.locals.user = null;
            }
        } catch (err) {
            event.locals.user = null;
        }
    } else {
        event.locals.user = null;
    }

    return resolve(event);
};
