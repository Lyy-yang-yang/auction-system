import { Router } from 'express';
import { numberController } from './number.controller';
import { authenticateToken } from '../../middleware/auth';

const router = Router();

// 公开路由 - 查询产品号码
router.get('/products/:productId/numbers', numberController.getNumbersByProduct);

// 需要登录 - 选择号码
router.post('/products/:productId/numbers/:numberId/select', authenticateToken, numberController.selectNumber);

export default router;