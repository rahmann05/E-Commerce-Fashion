import { json } from '@sveltejs/kit';

export async function POST({ cookies }) {
    try {
        cookies.delete('novure_uid', { path: '/' });

        return json({
            success: true,
            data: null,
            message: 'Logout successful'
        });
    } catch (error) {
        console.error('Logout error:', error);
        return json({ success: false, data: null, message: (error as Error).message || 'Internal server error' }, { status: 500 });
    }
}
