import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { prisma } from '@infrastructure/database/prisma';
import crypto from 'crypto';
import { env } from '$env/dynamic/private';

export const POST: RequestHandler = async ({ request }) => {
  try {
    const MIDTRANS_SERVER_KEY = env.MIDTRANS_SERVER_KEY || '';
    const body = await request.json();
    const { 
      order_id, 
      status_code, 
      gross_amount, 
      signature_key, 
      transaction_status 
    } = body;

    // 1. Basic Validation
    if (!order_id || !signature_key) {
      return json({ success: false, message: 'Invalid payload' }, { status: 400 });
    }

    // 2. Verify Signature
    const hashed = crypto
      .createHash('sha512')
      .update(`${order_id}${status_code}${gross_amount}${MIDTRANS_SERVER_KEY}`)
      .digest('hex');

    if (hashed !== signature_key) {
      console.warn('MIDTRANS_INVALID_SIGNATURE', { order_id, signature_key });
      return json({ success: false, message: 'Invalid signature' }, { status: 403 });
    }

    // 3. Find Order and protect state
    const order = await prisma.order.findUnique({
      where: { id: order_id }
    });

    if (!order) {
      console.error('MIDTRANS_ORDER_NOT_FOUND', { order_id });
      return json({ success: true, message: 'Order not found, acknowledgment sent' }); // Ack to stop retries
    }

    // Protection: Don't revert status if already SHIPPED, DELIVERED, or CANCELLED
    const finalStatuses = ['SHIPPED', 'DELIVERED', 'CANCELLED'];
    if (finalStatuses.includes(order.status)) {
      return json({ success: true, message: `Order already in final state: ${order.status}` });
    }

    // 4. Map status
    let orderStatus: 'PROCESSING' | 'CANCELLED' | 'AWAITING_PAYMENT' = 'AWAITING_PAYMENT';
    
    if (transaction_status === 'settlement' || transaction_status === 'capture') {
      orderStatus = 'PROCESSING';
    } else if (['expire', 'cancel', 'deny'].includes(transaction_status)) {
      orderStatus = 'CANCELLED';
    }

    // 5. Update Order
    if (orderStatus !== 'AWAITING_PAYMENT' && orderStatus !== order.status) {
      await prisma.order.update({
        where: { id: order_id },
        data: { status: orderStatus }
      });
      console.log(`ORDER_STATUS_UPDATED: ${order_id} -> ${orderStatus}`);
    }

    return json({ success: true, message: 'Notification processed' });
  } catch (error) {
    console.error('MIDTRANS_WEBHOOK_ERROR', error);
    return json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
};
