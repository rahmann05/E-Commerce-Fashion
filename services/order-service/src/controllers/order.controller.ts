import { Request, Response, NextFunction } from 'express';
import { OrderService } from '../services/order.service.js';

export class OrderController {
  static async getCustomerOrders(req: Request, res: Response, next: NextFunction) {
    try {
      const { customerId } = req.params;
      const data = await OrderService.getCustomerOrders(customerId);
      res.json({ success: true, data });
    } catch (err: any) {
      next(err);
    }
  }

  static async getCustomerOrderDetails(req: Request, res: Response, next: NextFunction) {
    try {
      const { customerId, orderId } = req.params;
      const order = await OrderService.getCustomerOrderDetails(customerId, orderId);
      if (!order) return res.status(404).json({ success: false, error: 'Order not found' });
      res.json({ success: true, data: order });
    } catch (err: any) {
      next(err);
    }
  }

  static async getAdminOrders(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await OrderService.getAdminOrders();
      res.json({ success: true, data });
    } catch (err: any) {
      next(err);
    }
  }

  static async getAdminOrderDetails(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const order = await OrderService.getAdminOrderDetails(id);
      if (!order) return res.status(404).json({ success: false, error: 'Order not found' });
      res.json({ success: true, data: order });
    } catch (err: any) {
      next(err);
    }
  }
}
