import { Request, Response } from 'express';
import db from '../../config/database';

export const adminBidController = {
  async getBids(req: Request, res: Response) {
    try {
      const { productId } = req.query;
      
      let query = db('bids')
        .join('users', 'bids.user_id', 'users.id')
        .join('products', 'bids.product_id', 'products.id')
        .select(
          'bids.id',
          'bids.amount',
          'bids.created_at',
          'users.email as user_email',
          'products.name as product_name'
        );
      
      if (productId) {
        query = query.where('bids.product_id', productId as string);
      }
      
      const bids = await query.orderBy('bids.created_at', 'desc');
      
      res.json({ success: true, data: bids });
    } catch (error) {
      console.error('获取竞价记录失败:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};