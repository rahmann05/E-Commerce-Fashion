import { Request, Response, NextFunction } from 'express';
import { ProductService } from '../services/product.service';

export class ProductController {
  static async getProducts(req: Request, res: Response, next: NextFunction) {
    try {
      const { categoryId, categoryName, category, q, ids } = req.query;
      const data = await ProductService.getProducts({
        categoryId: categoryId as string,
        categoryName: (categoryName || category) as string,
        query: q as string,
        idsParam: ids as string
      });
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  static async getProductById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const data = await ProductService.getProductById(id as string);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  static async getAdminProducts(req: Request, res: Response, next: NextFunction) {
    try {
      const { q, categoryId } = req.query;
      const data = await ProductService.getAdminProducts({
        q: q as string,
        categoryId: categoryId as string
      });
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  static async getAdminProductById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const data = await ProductService.getAdminProductById(id as string);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  static async createProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await ProductService.createProduct(req.body);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  static async updateProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const data = await ProductService.updateProduct(id as string, req.body);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  static async deleteProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const data = await ProductService.deleteProduct(id as string);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  static async deductStock(req: Request, res: Response, next: NextFunction) {
    try {
      const items = req.body.items;
      const data = await ProductService.deductStock(items);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }
}
