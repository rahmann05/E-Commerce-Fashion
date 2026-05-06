import { prisma } from '../db/client';
import midtransClient from 'midtrans-client';
import crypto from 'crypto';

const snap = new midtransClient.Snap({
  isProduction: process.env.MIDTRANS_IS_PRODUCTION === 'true',
  serverKey: process.env.MIDTRANS_SERVER_KEY || '',
  clientKey: process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || ''
});

const coreApi = new midtransClient.CoreApi({
  isProduction: process.env.MIDTRANS_IS_PRODUCTION === 'true',
  serverKey: process.env.MIDTRANS_SERVER_KEY || '',
  clientKey: process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || ''
});

export class CheckoutController {
  static async getMidtransStatus(orderId: string) {
    const status = await coreApi.transaction.status(orderId);
    
    // Auto-update local order status based on Midtrans status
    const transactionStatus = status.transaction_status;
    let orderStatus: any = null;

    if (transactionStatus === 'settlement' || transactionStatus === 'capture') {
      orderStatus = 'PROCESSING';
    } else if (['expire', 'cancel', 'deny'].includes(transactionStatus)) {
      orderStatus = 'CANCELLED';
    }

    if (orderStatus) {
      await prisma.order.update({
        where: { id: orderId },
        data: { status: orderStatus }
      });
    }

    return { data: status };
  }

  static async initiateCharge(userId: string, body: { order_id: string, payment_type: string, bank?: string, customer_details: any }) {
    const { order_id, payment_type, bank, customer_details } = body;

    const order = await prisma.order.findUnique({
      where: { id: order_id, customerId: userId },
      include: { items: true }
    });

    if (!order) throw new Error('Order not found');

    const productItems = order.items.map((item: any) => ({
      id: item.productId,
      price: Number(item.price),
      quantity: item.quantity,
      name: 'Product Item'
    }));

    const shippingFee = Number(order.shippingAmount) || 0;
    const itemsForMidtrans = [...productItems];
    
    if (shippingFee > 0) {
      itemsForMidtrans.push({
        id: 'shipping-fee',
        price: shippingFee,
        quantity: 1,
        name: 'Biaya Pengiriman'
      });
    }

    const calculatedGrossAmount = itemsForMidtrans.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    const parameter: any = {
      payment_type: payment_type || 'bank_transfer',
      transaction_details: {
        order_id: order_id,
        gross_amount: calculatedGrossAmount,
      },
      customer_details: {
        first_name: customer_details?.first_name || 'Customer',
        email: customer_details?.email || 'customer@example.com',
      },
      item_details: itemsForMidtrans
    };

    if (payment_type === 'bank_transfer' && bank) {
      parameter.bank_transfer = { bank };
    } else if (payment_type === 'echannel') {
        parameter.echannel = {
            bill_info1: "Order Payment",
            bill_info2: order_id
        };
    }

    const chargeResponse = await coreApi.charge(parameter);
    return { data: chargeResponse };
  }

  static async handleWebhook(body: any) {
    const { order_id, transaction_status, status_code, gross_amount, signature_key } = body;

    const serverKey = process.env.MIDTRANS_SERVER_KEY || '';
    const hash = crypto.createHash('sha512');
    hash.update(order_id + status_code + gross_amount + serverKey);
    const expectedSignature = hash.digest('hex');

    if (expectedSignature !== signature_key) {
      throw new Error('Invalid signature');
    }

    let orderStatus: any = 'AWAITING_PAYMENT';
    if (transaction_status === 'settlement' || transaction_status === 'capture') {
      orderStatus = 'PROCESSING';
    } else if (['expire', 'cancel', 'deny'].includes(transaction_status)) {
      orderStatus = 'CANCELLED';
    }

    if (orderStatus !== 'AWAITING_PAYMENT') {
      await prisma.order.update({
        where: { id: order_id },
        data: { status: orderStatus }
      });
    }

    return { success: true };
  }
}
