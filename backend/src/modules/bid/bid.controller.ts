import { Request, Response } from 'express';
import { AuthRequest } from '../../middleware/auth';
import { bidService } from './bid.service';
import db from '../../config/database';

export const bidController = {
  async placeBid(req: AuthRequest, res: Response) {
    try {
      const productId = req.params.productId as string;
      const numberId = req.params.numberId as string;
      const { amount } = req.body;
      const userId = req.userId!;
      
      console.log('收到出价请求:', { productId, numberId, amount, userId });
      
      // 验证金额
      if (!amount || amount <= 0) {
        return res.status(400).json({ error: '请输入有效金额' });
      }
      
      const result = await bidService.placeBid(productId, numberId, userId, amount);
      
      // 获取号码信息
      const numberInfo = await bidService.getNumberInfo(numberId);
      
      // 获取被超越的用户（查询该号码之前的最高出价者）
      const previousBid = await db('bids')
        .where({ number_id: numberId })
        .whereNot({ user_id: userId })
        .orderBy('amount', 'desc')
        .first();
      
      if (previousBid && previousBid.user_id !== userId) {
        // 创建被超越通知
        await db('notifications').insert({
          user_id: previousBid.user_id,
          product_id: productId,
          type: 'outbid',
          content: `您对号码 ${numberInfo?.number} 的出价 ${previousBid.amount} 已被超越`,
          sent_at: db.fn.now()
        });
        
        // WebSocket 广播被超越事件
        const io = req.app.get('io');
        if (io) {
          io.to(`user:${previousBid.user_id}`).emit('bid:outbid', {
            productId,
            numberId,
            oldAmount: previousBid.amount,
            newAmount: amount,
            number: numberInfo?.number
          });
        }
      }
      
      // WebSocket 广播新出价到号码房间
      const io = req.app.get('io');
      if (io) {
        io.to(`number:${numberId}`).emit('bid:new', {
          productId,
          numberId,
          amount: result.bid.amount,
          userId,
          timestamp: new Date()
        });
      }
      
      res.json({
        success: true,
        data: result
      });
    } catch (error: any) {
      console.error('出价错误:', error);
      if (error.message === '产品不存在') {
        res.status(404).json({ error: error.message });
      } else if (error.message === '号码不存在') {
        res.status(404).json({ error: error.message });
      } else if (error.message === '号码已售出') {
        res.status(400).json({ error: error.message });
      } else if (error.message === '拍卖已结束') {
        res.status(400).json({ error: error.message });
      } else if (error.message.includes('出价必须至少为')) {
        res.status(400).json({ error: error.message });
      } else if (error.message === '出价已被超越，请重新出价') {
        res.status(409).json({ error: error.message });
      } else if (error.message === '系统繁忙，请稍后重试') {
        res.status(429).json({ error: error.message });
      } else {
        res.status(500).json({ error: '内部服务器错误' });
      }
    }
  },
  
  async getBidsByNumber(req: Request, res: Response) {
    try {
      const numberId = req.params.numberId as string;
      const bids = await bidService.getBidsByNumber(numberId);
      res.json({ success: true, data: bids });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
};