import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { prisma } from '@infrastructure/database/prisma';
import crypto from 'crypto';

export const POST: RequestHandler = async ({ request }) => {
  try {
    const body = await request.json();
    const { 
      order_id, 
      status_code, 
      gross_amount, 
      signature_key, 
      transaction_status 
    } = body;

    // 1. Verify Signature
    // Midtrans signature requires exact string values for order_id, status_code, and gross_amount
    const serverKey = process.env.MIDTRANS_SERVER_KEY || '';
    const hashed = crypto
      .createHash('sha512')
      .update(`${order_id}${status_code}${gross_amount}${serverKey}`)
      .digest('hex');

    if (hashed !== signature_key) {
      console.warn('MIDTRANS_INVALID_SIGNATURE', { order_id, signature_key });
      return json({ success: false, message: 'Invalid signature' }, { status: 403 });
    }

    // 2. Map status
    // OrderStatus enum: AWAITING_PAYMENT, PROCESSING, SHIPPED, DELIVERED, CANCELLED, RETURNED, REFUNDED
    let orderStatus: 'PROCESSING' | 'CANCELLED' | 'AWAITING_PAYMENT' = 'AWAITING_PAYMENT';
    
    if (transaction_status === 'settlement' || transaction_status === 'capture') {
      orderStatus = 'PROCESSING';
    } else if (['expire', 'cancel', 'deny'].includes(transaction_status)) {
      orderStatus = 'CANCELLED';
    }

    // 3. Update Order
    if (orderStatus !== 'AWAITING_PAYMENT') {
      await prisma.order.update({
        where: { id: order_id },
        data: { status: orderStatus }
      });
      console.log(`ORDER_STATUS_UPDATED: ${order_id} -> ${orderStatus}`);
    }

    return json({ success: true, message: 'Notification processed' });
  } catch (error: unknown) {
    console.error('MIDTRANS_WEBHOOK_ERROR', error);
    return json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
};
