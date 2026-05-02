import { json } from '@sveltejs/kit';

export async function POST({ cookies }) {
    cookies.delete('novure_jwt', { path: '/' });
    cookies.delete('admin_session', { path: '/' });
    return json({ success: true });
}