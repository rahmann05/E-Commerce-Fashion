import prisma from "@/infrastructure/database/prisma";
import type { Prisma } from "@prisma/client";

export class ProductController {
  static async getProducts(params: { categoryId?: string | null, categoryName?: string | null, query?: string | null, idsParam?: string | null }) {
    const { categoryId, categoryName, query, idsParam } = params;

    let resolvedCategoryId = categoryId;

    if (categoryName && categoryName !== "all" && !resolvedCategoryId) {
      const mappedName = categoryName.charAt(0).toUpperCase() + categoryName.slice(1);
      const category = await prisma.category.findFirst({
        where: {
          name: {
            mode: 'insensitive',
            equals: mappedName
          }
        },
        select: { id: true }
      });

      if (category) {
        resolvedCategoryId = category.id;
      } else {
        return { data: [] };
      }
    }

    const where: Prisma.ProductWhereInput = {};

    if (!idsParam) {
      where.stock = { gt: 0 };
    }

    if (idsParam) {
      const ids = idsParam.split(',').map(id => id.trim()).filter(Boolean);
      if (ids.length > 0) {
        where.id = { in: ids };
      }
    }

    if (resolvedCategoryId) {
      where.categoryId = resolvedCategoryId;
    }

    if (query) {
      where.OR = [
        { name: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } }
      ];
    }

    const products = await prisma.product.findMany({
      where,
      include: {
        category: {
          select: { name: true }
        },
        variants: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return { data: products };
  }

  static async getAdminProducts(params: { q?: string | null, categoryId?: string | null }) {
    const { q, categoryId } = params;
    const products = await prisma.product.findMany({
      where: {
        categoryId: categoryId || undefined,
        OR: q ? [
          { name: { contains: q, mode: "insensitive" } },
          { description: { contains: q, mode: "insensitive" } }
        ] : undefined
      },
      include: { category: true },
      orderBy: { createdAt: "desc" }
    });
    return { data: products };
  }

  static async createProduct(data: any) {
    const slug = data.slug || data.name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');

    const product = await prisma.product.create({
      data: {
        name: data.name,
        slug,
        description: data.description,
        price: data.price,
        stock: data.stock,
        categoryId: data.categoryId,
        image: data.images || []
      }
    });
    return { data: product };
  }
}
