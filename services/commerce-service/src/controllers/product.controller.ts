import { Request, Response, NextFunction } from 'express';
import { ProductService } from '../services/product.service';

export class ProductController {
  static async getProducts(req: Request, res: Response, next: NextFunction) {
    try {
      const { categoryId, categoryName, q, ids } = req.query;
      const data = await ProductService.getProducts({
        categoryId: categoryId as string,
        categoryName: categoryName as string,
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
      const data = await ProductService.getProductById(req.params.id);
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
      const data = await ProductService.getAdminProductById(req.params.id);
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
      const data = await ProductService.updateProduct(req.params.id, req.body);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  static async deleteProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await ProductService.deleteProduct(req.params.id);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }
}
