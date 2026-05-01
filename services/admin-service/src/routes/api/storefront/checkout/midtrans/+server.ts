import { json } from '@sveltejs/kit';
import { prisma } from '@infrastructure/database/prisma';
import midtransClient from 'midtrans-client';
import { cartService } from '@application/services/cart.service';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const snap = new (midtransClient as any).Snap({
  isProduction: process.env.MIDTRANS_IS_PRODUCTION === 'true',
  serverKey: process.env.MIDTRANS_SERVER_KEY || '',
  clientKey: process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || '',
});

const SESSION_COOKIE_NAME = 'novure_uid';

export async function POST({ cookies }) {
  try {
    const customerId = cookies.get(SESSION_COOKIE_NAME);
    if (!customerId) return json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
      include: {
        cart: {
          include: {
            items: true
          }
        }
      }
    });

    if (!customer || !customer.cart || customer.cart.items.length === 0) {
      return json({ success: false, error: 'Keranjang belanja kosong.' }, { status: 400 });
    }

    // Hydrate and Validate Stocks
    const itemsWithDetails = [];
    for (const item of customer.cart.items) {
      const product = await cartService.fetchProduct(item.productId);
      if (!product) {
        return json({ success: false, error: `Produk ID ${item.productId} tidak ditemukan.` }, { status: 400 });
      }

      const variant = product.variants.find(v => v.id === item.productVariantId);
      if (!variant) {
        return json({ success: false, error: `Variant untuk ${product.name} tidak ditemukan.` }, { status: 400 });
      }

      if (variant.stock < item.quantity) {
        return json({
          success: false,
          error: `Stok untuk ${product.name} ukuran ${variant.size} tidak mencukupi (Tersisa: ${variant.stock}).`
        }, { status: 400 });
      }

      itemsWithDetails.push({
        ...item,
        price: product.price,
        name: product.name,
        size: variant.size
      });
    }

    const totalAmount = itemsWithDetails.reduce((acc, item) => acc + Number(item.price) * item.quantity, 0);

    // Create Order
    const order = await prisma.order.create({
      data: {
        customerId: customer.id,
        totalAmount,
        status: 'AWAITING_PAYMENT',
        items: {
          create: itemsWithDetails.map(item => ({
            productId: item.productId,
            productVariantId: item.productVariantId,
            size: item.size,
            quantity: item.quantity,
            price: item.price
          }))
        }
      }
    });

    const parameter = {
      transaction_details: {
        order_id: order.id,
        gross_amount: totalAmount,
      },
      customer_details: {
        first_name: customer.name,
        email: customer.email,
        phone: customer.phone,
      },
    };

    const transaction = await snap.createTransaction(parameter);

    // Clear cart after successful transaction creation
    await cartService.clearCart(customerId);

    return json({
      success: true,
      data: {
        token: transaction.token,
        redirect_url: transaction.redirect_url,
        orderId: order.id
      },
      message: 'Transaksi berhasil dibuat.'
    });
  } catch (error) {
    console.error('[API] Checkout error:', error);
    return json({ success: false, error: (error as Error).message || 'Gagal memproses transaksi.' }, { status: 500 });
  }
}
