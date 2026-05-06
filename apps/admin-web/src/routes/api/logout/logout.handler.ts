import { redirect, type RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ cookies }) => {
  cookies.delete('novure_jwt', { path: '/' });
  throw redirect(303, '/login');
};

export const POST: RequestHandler = async ({ cookies }) => {
  cookies.delete('novure_jwt', { path: '/' });
  throw redirect(303, '/login');
};
