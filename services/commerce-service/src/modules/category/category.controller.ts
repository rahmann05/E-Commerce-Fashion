import prisma from "@/infrastructure/database/prisma";

export class CategoryController {
  static async getCategories() {
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { products: true }
        }
      },
      orderBy: { name: 'asc' }
    });
    return { data: categories };
  }

  static async createCategory(data: any) {
    const category = await prisma.category.create({
      data: {
        name: data.name,
        description: data.description,
        image: data.image
      }
    });
    return { data: category };
  }

  static async getCategoryById(id: string) {
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        products: {
          orderBy: { createdAt: 'desc' }
        },
        _count: {
          select: { products: true }
        }
      }
    });
    return { data: category };
  }

  static async updateCategory(id: string, data: any) {
    const updateData: { name?: string; image?: string; slug?: string } = { ...data };
    if (data.name) {
      updateData.slug = data.name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
    }

    const updated = await prisma.category.update({
      where: { id },
      data: updateData
    });
    return { data: updated };
  }

  static async deleteCategory(id: string) {
    const productsCount = await prisma.product.count({ where: { categoryId: id } });
    if (productsCount > 0) throw new Error("Cannot delete category with products");
    
    await prisma.category.delete({ where: { id } });
    return { success: true };
  }
}
