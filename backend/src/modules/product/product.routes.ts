import { Router } from 'express';
import { productController } from './product.controller';
import { authenticateToken } from '../../middleware/auth';
import { isAdmin } from '../../middleware/isAdmin';

const router = Router();

// 公开路由
router.get('/', productController.getAll);
router.get('/:id', productController.getById);

// 管理员路由
router.post('/admin/products', authenticateToken, isAdmin, productController.create);
router.put('/admin/products/:id', authenticateToken, isAdmin, productController.update);
router.delete('/admin/products/:id', authenticateToken, isAdmin, productController.delete);

export default router;