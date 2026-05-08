import { Router } from 'express';
import { adminOrderController } from './adminOrder.controller';
import { adminBidController } from './adminBid.controller';
import { adminNotificationController } from './adminNotification.controller';
import { authenticateToken } from '../../middleware/auth';
import { isAdmin } from '../../middleware/isAdmin';

const router = Router();

// 管理员路由
router.get('/admin/orders', authenticateToken, isAdmin, adminOrderController.getOrders);
router.get('/admin/bids', authenticateToken, isAdmin, adminBidController.getBids);
router.get('/admin/notifications', authenticateToken, isAdmin, adminNotificationController.getNotifications);

// 用户路由
router.get('/users/:userId/notifications', authenticateToken, adminNotificationController.getUserNotifications);
router.put('/notifications/:id/read', authenticateToken, adminNotificationController.markAsRead);

export default router;