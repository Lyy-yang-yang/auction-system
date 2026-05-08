import { Request, Response } from 'express';
import { numberService } from './number.service';
import { AuthRequest } from '../../middleware/auth';

export const numberController = {
  async getNumbersByProduct(req: Request, res: Response) {
    try {
      const productId = req.params.productId as string;
      const numbers = await numberService.getNumbersByProduct(productId);
      res.json({ success: true, data: numbers });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  async selectNumber(req: AuthRequest, res: Response) {
    try {
      const productId = req.params.productId as string;
      const numberId = req.params.numberId as string;
      const userId = req.userId!;
      
      const result = await numberService.selectNumber(productId, numberId, userId);
      res.json(result);
    } catch (error: any) {
      if (error.message === '号码不存在') {
        res.status(404).json({ error: error.message });
      } else if (error.message === '号码已被选') {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: error.message });
      }
    }
  }
};