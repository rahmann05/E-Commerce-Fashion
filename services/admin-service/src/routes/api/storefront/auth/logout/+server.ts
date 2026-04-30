import { json } from '@sveltejs/kit';

export async function POST({ cookies }) {
    try {
        cookies.delete('novure_uid', { path: '/' });

        return json({
            success: true,
            data: null,
            message: 'Logout successful'
        });
    } catch (error: any) {
        console.error('Logout error:', error);
        return json({ success: false, data: null, message: error.message || 'Internal server error' }, { status: 500 });
    }
}
