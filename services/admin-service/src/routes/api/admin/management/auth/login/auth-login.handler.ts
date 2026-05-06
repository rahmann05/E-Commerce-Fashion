import { json } from '@sveltejs/kit';
import { AdminAuthController } from '../../../../../../modules/auth/auth.controller';

export async function POST({ request, cookies }) {
  try {
    const { email, password } = await request.json();
    const result = await AdminAuthController.login({ email, password });

    cookies.set('novure_jwt', result.token, {
      path: '/',
      httpOnly: true,
      secure: false, // Development
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7 // 1 week
    });

    // Also clear the old session cookie if it exists
    cookies.delete('admin_session', { path: '/' });

    return json({
      success: true,
      data: result.user,
      token: result.token
    });
  } catch (error: any) {
    return json({ success: false, error: error.message }, { status: 401 });
  }
}
