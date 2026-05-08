import { Router } from 'express';
import { bidController } from './bid.controller';
import { authenticateToken } from '../../middleware/auth';

const router = Router();

// 需要登录 - 对指定号码出价
router.post('/products/:productId/numbers/:numberId/bids', authenticateToken, bidController.placeBid);

// 公开 - 查询指定号码的出价记录
router.get('/products/:productId/numbers/:numberId/bids', bidController.getBidsByNumber);

export default router;