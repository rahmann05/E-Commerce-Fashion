import { json } from '@sveltejs/kit';
import { prisma } from '@infrastructure/database/prisma';

const SESSION_COOKIE_NAME = 'novure_uid';

export async function GET({ cookies }) {
  try {
    const customerId = cookies.get(SESSION_COOKIE_NAME);
    if (!customerId) return json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
      include: {
        addresses: true,
        paymentMethods: true,
      }
    });

    if (!customer) return json({ success: false, error: 'Not found' }, { status: 404 });

    const orders = await prisma.order.findMany({
      where: { customerId },
      orderBy: { createdAt: 'desc' },
      include: {
        items: true,
        shipping: true
      }
    });

    return json({
      success: true,
      data: {
        phone: customer.phone || '',
        addresses: customer.addresses,
        paymentMethods: customer.paymentMethods,
        orders: orders.map(o => ({
            id: o.id,
            status: o.status,
            createdAt: o.createdAt,
            total: o.total,
            items: o.items.map(i => ({
                productId: i.productId,
                name: i.name,
                quantity: i.quantity,
                price: Number(i.price),
                image: i.imageUrl
            }))
        })),
        wishlist: [],
        vouchers: [],
        notifications: []
      }
    });
  } catch (error) {
    return json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST({ request, cookies }) {
  try {
    const customerId = cookies.get(SESSION_COOKIE_NAME);
    if (!customerId) return json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const payload = await request.json();
    const { action, ...body } = payload;

    if (action === 'addAddress') {
      await prisma.address.create({
        data: {
          label: body.label || 'Rumah',
          recipient: body.recipient,
          phone: body.phone,
          line1: body.line1,
          district: body.district,
          city: body.city,
          province: body.province,
          postalCode: body.postalCode,
          latitude: body.latitude,
          longitude: body.longitude,
          isPrimary: false,
          customerId
        }
      });
    } else if (action === 'removeAddress') {
      await prisma.address.delete({
        where: { id: body.id }
      });
    } else if (action === 'addPaymentMethod') {
      await prisma.paymentMethod.create({
        data: {
          label: body.label,
          accountNumber: body.accountNumber,
          accountName: body.accountName,
          details: body.label,
          isPrimary: false,
          customerId
        }
      });
    } else if (action === 'removePaymentMethod') {
      await prisma.paymentMethod.delete({
        where: { id: body.id }
      });
    } else if (action === 'saveProfileInfo') {
      await prisma.customer.update({
        where: { id: customerId },
        data: { phone: body.phone, name: body.name }
      });
    }

    // After mutation, fetch the updated customer profile data
    const customer = await prisma.customer.findUnique({
        where: { id: customerId },
        include: {
          addresses: true,
          paymentMethods: true,
        }
    });
  
    const orders = await prisma.order.findMany({
        where: { customerId },
        orderBy: { createdAt: 'desc' },
        include: {
          items: true,
          shipping: true
        }
    });
  
    return json({
        success: true,
        data: {
          phone: customer?.phone || '',
          addresses: customer?.addresses || [],
          paymentMethods: customer?.paymentMethods || [],
          orders: orders.map(o => ({
              id: o.id,
              status: o.status,
              createdAt: o.createdAt,
              total: o.total,
              items: o.items.map(i => ({
                  productId: i.productId,
                  name: i.name,
                  quantity: i.quantity,
                  price: Number(i.price),
                  image: i.imageUrl
              }))
          })),
          wishlist: [],
          vouchers: [],
          notifications: []
        }
    });
  } catch (error) {
    return json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}