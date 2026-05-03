import { Router } from 'express';
import { prisma } from '../infrastructure/prisma';
import { authenticateJWT, AuthRequest } from '../middleware/auth';
import midtransClient from 'midtrans-client';

const router = Router();

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

// Internal URL for Commerce Service
const COMMERCE_SERVICE_URL = process.env.COMMERCE_SERVICE_URL || 'http://commerce-service:3001';

// GET /api/storefront/checkout/midtrans/status?orderId=...
router.get('/midtrans/status', async (req, res) => {
  try {
    const { orderId } = req.query;
    if (!orderId) return res.status(400).json({ success: false, error: 'Order ID required' });

    const status = await coreApi.transaction.status(orderId as string);
    
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
        where: { id: orderId as string },
        data: { status: orderStatus }
      });
      console.log(`[Checkout] Auto-updated Order ${orderId} status to ${orderStatus}`);
    }

    res.json({ success: true, data: status });
  } catch (error: any) {
    console.error('[Midtrans] Status Error:', error.message);
    res.status(500).json({ success: false, error: 'Failed to fetch payment status' });
  }
});

// POST /api/storefront/checkout/midtrans - Initiate charge
router.post('/midtrans', authenticateJWT, async (req: AuthRequest, res) => {
  try {
    const customerId = req.user!.id;
    const { order_id, payment_type, bank, customer_details } = req.body;

    const order = await prisma.order.findUnique({
      where: { id: order_id, customerId },
      include: { items: true }
    });

    if (!order) return res.status(404).json({ success: false, error: 'Order not found' });

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

    // Recalculate total to ensure perfect match with item_details sum
    const calculatedGrossAmount = itemsForMidtrans.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    console.log(`[Midtrans] Calculated Gross Amount: ${calculatedGrossAmount}`);
    console.log(`[Midtrans] Item Details: ${JSON.stringify(itemsForMidtrans)}`);

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
    console.log(`[Midtrans] Charge success for ${order_id}`);
    res.json({ success: true, data: chargeResponse });
  } catch (error: any) {
    console.error('[Midtrans] Charge Error:', error.message);
    if (error.ApiResponse) {
      console.error('[Midtrans] Midtrans Response Error:', JSON.stringify(error.ApiResponse));
    }
    
    // Specific handling for 402: Payment channel not activated
    if (error.message.includes('402') || (error.ApiResponse && error.ApiResponse.status_code === '402')) {
        return res.status(402).json({ 
            success: false, 
            error: 'Metode pembayaran ini belum diaktifkan di Dashboard Midtrans Anda. Silakan aktifkan di Settings > Payment Methods.' 
        });
    }
    
    res.status(500).json({ success: false, error: error.message || 'Failed to initiate payment' });
  }
});

// POST /api/storefront/checkout/midtrans/notification - Webhook
router.post('/midtrans/notification', async (req, res) => {
  try {
    const body = req.body;
    const { order_id, transaction_status } = body;

    console.log(`[Midtrans] Notification for ${order_id}: ${transaction_status}`);

    // Simplified update (full verification can be added if server key is present)
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

    res.json({ success: true });
  } catch (error: any) {
    console.error('[Midtrans] Webhook Error:', error.message);
    res.status(500).json({ success: false });
  }
});

export default router;