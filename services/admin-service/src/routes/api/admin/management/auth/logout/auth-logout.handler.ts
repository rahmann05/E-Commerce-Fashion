import { json } from '@sveltejs/kit';
import { AdminAuthController } from '../../../../../../modules/auth/auth.controller';

export async function POST({ cookies }) {
  const result = await AdminAuthController.logout(cookies);
  return json(result);
}
