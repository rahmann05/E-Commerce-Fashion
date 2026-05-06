import { json, type RequestEvent } from '@sveltejs/kit';
import { AdminAuthController } from '../../../../../../modules/auth/auth.controller';

export async function POST({ cookies }: RequestEvent) {
  const result = await AdminAuthController.logout(cookies);
  return json(result);
}
