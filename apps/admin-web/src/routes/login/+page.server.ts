import { fail, redirect, isRedirect } from '@sveltejs/kit';
import { INTERNAL_API_URL } from '$lib/config';

export const actions = {
    login: async ({ request, cookies }) => {
        console.log('[LoginAction] Action started');
        const formData = await request.formData();
        const email = formData.get('email');
        const password = formData.get('password');

        if (!email || !password) {
            return fail(400, { error: 'Email and password are required' });
        }

        try {
            console.log(`[LoginAction] Fetching from ${INTERNAL_API_URL}/auth/login`);
            const res = await fetch(`${INTERNAL_API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await res.json().catch(() => ({}));

            if (res.ok) {
                console.log(`[LoginAction] Success for ${email}`);
                cookies.set('novure_jwt', data.token, {
                    path: '/',
                    httpOnly: true,
                    secure: false,
                    sameSite: 'lax',
                    maxAge: 60 * 60 * 24 * 7
                });
                throw redirect(303, '/');
            } else {
                console.warn(`[LoginAction] Failed: ${res.status}`, data);
                return fail(res.status, { error: data.error || 'Login failed' });
            }
        } catch (err: any) {
            if (isRedirect(err)) throw err;
            console.error('[LoginAction] Error:', err);
            return fail(500, { error: 'Internal Server Error: ' + err.message });
        }
    },
    logout: async ({ cookies }) => {
        cookies.delete('novure_jwt', { path: '/' });
        throw redirect(303, '/login');
    }
};
