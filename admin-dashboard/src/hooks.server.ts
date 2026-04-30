import { redirect } from '@sveltejs/kit';
import { API_BASE_URL } from '$lib/config';

export const handle = async ({ event, resolve }) => {
    // Check session from cookies or by calling the API
    const sessionCookie = event.cookies.get('admin_session');
    
    if (sessionCookie) {
        try {
            // Forward cookie to API
            const res = await fetch(`${API_BASE_URL}/api/auth/me`, {
                headers: { cookie: `admin_session=${sessionCookie}` }
            });
            if (res.ok) {
                const data = await res.json();
                event.locals.user = data.user;
            }
        } catch (e) {}
    }

    if (event.url.pathname.startsWith('/') && !event.url.pathname.startsWith('/login')) {
        if (!event.locals.user) {
            throw redirect(303, '/login');
        }
    }

    return resolve(event);
};