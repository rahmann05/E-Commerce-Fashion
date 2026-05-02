import { redirect } from '@sveltejs/kit';

export const GET = async ({ cookies }) => {
    cookies.delete('novure_jwt', { path: '/' });
    throw redirect(303, '/login');
};

export const POST = async ({ cookies }) => {
    cookies.delete('novure_jwt', { path: '/' });
    throw redirect(303, '/login');
};
