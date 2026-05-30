import { Request, Response, NextFunction } from 'express';
import { CategoryService } from '../services/category.service';

export class CategoryController {
  static async getCategories(req: Request, res: Response, next: NextFunction) {
    try { res.json(await CategoryService.getCategories()); } catch(e) { next(e); }
  }
  static async createCategory(req: Request, res: Response, next: NextFunction) {
    try { res.json(await CategoryService.createCategory(req.body)); } catch(e) { next(e); }
  }
  static async getCategoryById(req: Request, res: Response, next: NextFunction) {
    try { res.json(await CategoryService.getCategoryById(req.params.id)); } catch(e) { next(e); }
  }
  static async updateCategory(req: Request, res: Response, next: NextFunction) {
    try { res.json(await CategoryService.updateCategory(req.params.id, req.body)); } catch(e) { next(e); }
  }
  static async deleteCategory(req: Request, res: Response, next: NextFunction) {
    try { res.json(await CategoryService.deleteCategory(req.params.id)); } catch(e) { next(e); }
  }
}
