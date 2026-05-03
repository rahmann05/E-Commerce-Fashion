import { redirect } from '@sveltejs/kit';
import { INTERNAL_API_URL } from '$lib/config';

export const handle = async ({ event, resolve }) => {
    event.locals.user = null;
    const token = event.cookies.get('novure_jwt');
    const isLoginPage = event.url.pathname === '/login';
    
    console.log(`[Hooks] Path: ${event.url.pathname}, Token present: ${!!token}`);

    if (token) {
        try {
            const res = await fetch(`${INTERNAL_API_URL}/auth/me`, {
                headers: { cookie: `novure_jwt=${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                event.locals.user = data.user;
                console.log(`[Hooks] Auth SUCCESS for ${data.user.email}`);
            } else {
                console.warn(`[Hooks] Auth FAILED: API returned ${res.status}`);
                event.cookies.delete('novure_jwt', { path: '/' });
            }
        } catch (e) {
            console.error(`[Hooks] Auth ERROR:`, e);
            event.cookies.delete('novure_jwt', { path: '/' });
        }
    }

    console.log(`[Hooks] Final user state: ${event.locals.user ? event.locals.user.email : 'null'}`);

    if (!event.locals.user && !isLoginPage && !event.url.pathname.startsWith('/api')) {
        console.log(`[Hooks] REDIRECTING to /login`);
        throw redirect(303, '/login');
    }

    if (event.locals.user && isLoginPage) {
        console.log(`[Hooks] ALREADY LOGGED IN, redirecting to /`);
        throw redirect(303, '/');
    }

    return resolve(event);
};