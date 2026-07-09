import prisma from '../db/client';
import { Prisma } from "@novarium/commerce-prisma";

export class ProductService {
  static async getProducts(params: { categoryId?: string, categoryName?: string, query?: string, idsParam?: string }) {
    const { categoryId, categoryName, query, idsParam } = params;

    let resolvedCategoryId = categoryId;

    if (categoryName && categoryName !== "all" && !resolvedCategoryId) {
      const mappedName = categoryName.charAt(0).toUpperCase() + categoryName.slice(1);
      const category = await prisma.category.findFirst({
        where: { name: { mode: 'insensitive', equals: mappedName } },
        select: { id: true }
      });
      if (category) resolvedCategoryId = category.id;
      else return [];
    }

    const where: Prisma.ProductWhereInput = {};
    if (!idsParam) where.stock = { gt: 0 };
    if (idsParam) {
      const ids = idsParam.split(',').map(id => id.trim()).filter(Boolean);
      if (ids.length > 0) where.id = { in: ids };
    }
    if (resolvedCategoryId) where.categoryId = resolvedCategoryId;
    if (query) {
      where.OR = [
        { name: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } }
      ];
    }

    return await prisma.product.findMany({
      where,
      include: { category: { select: { name: true } }, variants: true },
      orderBy: { createdAt: 'desc' }
    });
  }

  static async getProductById(id: string) {
    const product = await prisma.product.findUnique({
      where: { id },
      include: { category: true, variants: true }
    });
    if (!product) throw new Error('Produk tidak ditemukan');
    return product;
  }

  static async getAdminProducts(params: { q?: string; categoryId?: string }) {
    const { q, categoryId } = params;

    const where: Prisma.ProductWhereInput = {};
    if (categoryId) where.categoryId = categoryId;
    if (q) {
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } }
      ];
    }

    return await prisma.product.findMany({
      where,
      include: { category: { select: { name: true } }, variants: true },
      orderBy: { createdAt: 'desc' }
    });
  }

  static async getAdminProductById(id: string) {
    const product = await prisma.product.findUnique({
      where: { id },
      include: { category: true, variants: true }
    });
    if (!product) throw new Error('Produk tidak ditemukan');
    return product;
  }

  static async createProduct(data: Record<string, unknown>) {
    const name = String(data.name || '').trim();
    if (!name) throw new Error('Nama produk wajib diisi');

    const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const categoryId = String(data.categoryId || '').trim();
    if (!categoryId) throw new Error('Kategori wajib diisi');

    return await prisma.product.create({
      data: {
        name,
        slug,
        description: (data.description as string) || null,
        price: new Prisma.Decimal(Number(data.price || 0)),
        image: Array.isArray(data.image) ? (data.image as string[]) : [],
        colors: Array.isArray(data.colors) ? (data.colors as string[]) : [],
        sizeOptions: Array.isArray(data.sizeOptions) ? (data.sizeOptions as string[]) : [],
        sizeStocks: Array.isArray(data.sizeStocks) ? (data.sizeStocks as number[]) : [],
        categoryId,
        stock: Number(data.stock || 0),
        isFeatured: Boolean(data.isFeatured || false)
      }
    });
  }

  static async updateProduct(id: string, data: Record<string, unknown>) {
    const updateData: Prisma.ProductUpdateInput = {};
    if (typeof data.name === 'string' && data.name.trim()) {
      updateData.slug = data.name
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '');
      updateData.name = data.name.trim();
    }

    if (typeof data.description === 'string') updateData.description = data.description;
    if (data.price !== undefined) updateData.price = new Prisma.Decimal(Number(data.price));
    if (typeof data.categoryId === 'string') {
      updateData.category = { connect: { id: data.categoryId } };
    }
    if (data.stock !== undefined) updateData.stock = Number(data.stock);
    if (data.isFeatured !== undefined) updateData.isFeatured = Boolean(data.isFeatured);
    if (Array.isArray(data.image)) updateData.image = data.image as string[];
    if (Array.isArray(data.colors)) updateData.colors = data.colors as string[];
    if (Array.isArray(data.sizeOptions)) updateData.sizeOptions = data.sizeOptions as string[];
    if (Array.isArray(data.sizeStocks)) updateData.sizeStocks = data.sizeStocks as number[];

    return await prisma.product.update({
      where: { id },
      data: updateData
    });
  }

  static async deleteProduct(id: string) {
    await prisma.product.delete({ where: { id } });
    return { id };
  }

  static async deductStock(items: { productId: string, productVariantId?: string, quantity: number, size?: string }[]) {
    for (const item of items) {
      if (item.productVariantId) {
        await prisma.productVariant.update({
          where: { id: item.productVariantId },
          data: { stock: { decrement: item.quantity } }
        }).catch(e => console.error("Failed to deduct variant stock:", e));
      }
      // Always deduct main product stock as well
      await prisma.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } }
      }).catch(e => console.error("Failed to deduct product stock:", e));
    }
    return { success: true };
  }
}
