import { Request, Response } from 'express';
import db from '../../config/database';

export const adminNotificationController = {
  // 管理员查看所有通知
  async getNotifications(req: Request, res: Response) {
    try {
      const notifications = await db('notifications')
        .join('users', 'notifications.user_id', 'users.id')
        .select(
          'notifications.id',
          'notifications.type',
          'notifications.content',
          'notifications.is_read',
          'notifications.sent_at',
          'users.email as user_email'
        )
        .orderBy('notifications.sent_at', 'desc');
      
      res.json({ success: true, data: notifications });
    } catch (error) {
      console.error('获取通知记录失败:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // 用户获取自己的通知
  async getUserNotifications(req: Request, res: Response) {
    try {
      const userId = (req as any).userId;
      const notifications = await db('notifications')
        .where({ user_id: userId })
        .orderBy('sent_at', 'desc')
        .select(
          'id',
          'type',
          'content',
          'is_read',
          'sent_at',
          'product_id'
        );
      
      // 获取产品名称
      const notificationsWithProduct = await Promise.all(
        notifications.map(async (notif) => {
          if (notif.product_id) {
            const product = await db('products')
              .where({ id: notif.product_id })
              .select('name')
              .first();
            return { ...notif, product_name: product?.name || null };
          }
          return notif;
        })
      );
      
      res.json({ success: true, data: notificationsWithProduct });
    } catch (error) {
      console.error('获取用户通知失败:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // 标记通知为已读
  async markAsRead(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = (req as any).userId;
      
      // 确保只能标记自己的通知
      await db('notifications')
        .where({ id })
        .andWhere({ user_id: userId })
        .update({ is_read: true });
      
      res.json({ success: true });
    } catch (error) {
      console.error('标记已读失败:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};