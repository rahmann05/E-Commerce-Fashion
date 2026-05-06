import { json, type RequestEvent } from '@sveltejs/kit';
import { AdminAuthController } from '../../../../../../modules/auth/auth.controller';

export async function GET({ cookies }: RequestEvent) {
  const token = cookies.get('novure_jwt');
  if (!token) return json({ success: false, error: 'Unauthorized' }, { status: 401 });

  try {
    const user = await AdminAuthController.getMe(token);
    return json({
      success: true,
      data: user
    });
  } catch (err: any) {
    return json({ success: false, error: err.message }, { status: 401 });
  }
}
