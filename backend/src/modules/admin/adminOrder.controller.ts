import { Request, Response } from 'express';
import db from '../../config/database';

export const adminOrderController = {
  async getOrders(req: Request, res: Response) {
    try {
      const { productId } = req.query;
      
      let query = db('numbers')
        .join('products', 'numbers.product_id', 'products.id')
        .join('users', 'numbers.user_id', 'users.id')
        .select(
          'numbers.id',
          'numbers.number',
          'numbers.reserved_at as sold_at',
          'products.current_price as final_price',
          'users.email as user_email',
          'users.username as user_name',
          'products.name as product_name'
        )
        .where('numbers.status', 'sold');
      
      if (productId) {
        query = query.where('numbers.product_id', productId as string);
      }
      
      const orders = await query.orderBy('numbers.reserved_at', 'desc');
      
      res.json({ success: true, data: orders });
    } catch (error) {
      console.error('获取订单失败:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};