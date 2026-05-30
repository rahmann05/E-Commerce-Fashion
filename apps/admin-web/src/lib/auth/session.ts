import { redirect } from '@sveltejs/kit';

export const handleLogout = async (cookies: any) => {
  cookies.delete('novarium_jwt', { path: '/' });
  throw redirect(303, '/login');
};
