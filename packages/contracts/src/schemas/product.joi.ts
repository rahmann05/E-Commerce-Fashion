import Joi from 'joi';

export const ProductVariantSchema = Joi.object({
  id: Joi.string().required(),
  productId: Joi.string().required(),
  sku: Joi.string().optional(),
  size: Joi.string().required(),
  color: Joi.string().optional().allow(null),
  stock: Joi.number().integer().min(0).required(),
  price: Joi.number().optional().allow(null)
});

export const ProductSchema = Joi.object({
  id: Joi.string().required(),
  name: Joi.string().required(),
  slug: Joi.string().optional(),
  description: Joi.string().optional().allow(null),
  price: Joi.number().required(),
  image: Joi.array().items(Joi.string().uri()).optional(),
  colors: Joi.array().items(Joi.string()).optional(),
  sizeOptions: Joi.array().items(Joi.string()).optional(),
  sizeStocks: Joi.array().items(Joi.number().integer()).optional(),
  rating: Joi.number().optional(),
  inStock: Joi.boolean().required(),
  categoryId: Joi.string().required(),
  category: Joi.object({
    id: Joi.string().required(),
    name: Joi.string().required()
  }).optional(),
  variants: Joi.array().items(ProductVariantSchema).optional()
});

export const CartItemSchema = Joi.object({
  id: Joi.string().required(),
  productId: Joi.string().required(),
  productVariantId: Joi.string().required(),
  quantity: Joi.number().integer().min(1).required(),
  product: ProductSchema.optional(),
  variant: ProductVariantSchema.optional()
});

export const OrderItemSchema = Joi.object({
  id: Joi.string().required(),
  productId: Joi.string().required(),
  productVariantId: Joi.string().optional().allow(null),
  quantity: Joi.number().integer().min(1).required(),
  price: Joi.number().required()
});

export const OrderSchema = Joi.object({
  id: Joi.string().required(),
  customerId: Joi.string().required(),
  totalAmount: Joi.number().required(),
  shippingAmount: Joi.number().optional().allow(null),
  status: Joi.string().valid('AWAITING_PAYMENT', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'RETURNED', 'REFUNDED').required(),
  createdAt: Joi.date().iso().required(),
  items: Joi.array().items(OrderItemSchema).optional()
});
