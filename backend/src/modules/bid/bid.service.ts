import db from '../../config/database';
import { getIO } from '../../config/socket';
import { redisSet, redisGet, redisDel, redisEval } from '../../config/redis';

export const bidService = {
  async placeBid(productId: string, numberId: string, userId: string, amount: number) {
    console.log('=== bidService.placeBid 开始 (号码级) ===');
    console.log('参数:', { productId, numberId, userId, amount });
    
    // 1. 获取号码信息和产品信息
    const number = await db('numbers')
      .where({ id: numberId, product_id: productId })
      .first();
    
    if (!number) {
      throw new Error('号码不存在');
    }
    
    if (number.status === 'sold') {
      throw new Error('号码已售出');
    }
    
    const product = await db('products').where({ id: productId }).first();
    if (!product) {
      throw new Error('产品不存在');
    }
    
    // 检查拍卖是否结束
    if (new Date(product.bid_end_time) < new Date()) {
      throw new Error('拍卖已结束');
    }
    
    // 计算最低出价
    const currentBid = number.current_bid || product.base_price;
    const minBid = Number(currentBid) + Number(product.min_bid_increment);
    
    console.log('当前最高价:', currentBid, '最低出价:', minBid);
    
    if (amount < minBid) {
      throw new Error(`出价必须至少为 ${minBid}`);
    }
    
    // 2. Redis 分布式锁（号码级）
    const lockKey = `lock:number:${numberId}`;
    const lockValue = Date.now().toString();
    const acquired = await redisSet(lockKey, lockValue, 'EX', 5);
    
    if (!acquired) {
      throw new Error('系统繁忙，请稍后重试');
    }
    
    try {
      // 3. Lua 脚本 - 原子性检查最高价（号码级）
      const luaScript = `
        local key = KEYS[1]
        local bidAmount = tonumber(ARGV[1])
        local current = redis.call('GET', key)
        if not current or tonumber(current) < bidAmount then
          redis.call('SET', key, bidAmount)
          return 1
        else
          return 0
        end
      `;
      
      const highestKey = `highest_bid:number:${numberId}`;
      const result = await redisEval(luaScript, 1, highestKey, amount.toString());
      
      if (result === 0) {
        throw new Error('出价已被超越，请重新出价');
      }
      
      // 4. 数据库事务
      const trx = await db.transaction();
      
      try {
        // 获取之前的最高出价者（用于被超越通知）
        const previousHighestBidder = number.current_bid_user_id;
        
        // 插入出价记录
        const [bid] = await trx('bids')
          .insert({
            product_id: productId,
            number_id: numberId,
            user_id: userId,
            amount: amount,
            is_winning: true
          })
          .returning('*');
        console.log('插入出价记录成功:', bid.id);
        
        // 更新号码的当前最高价和最高价用户
        await trx('numbers')
          .where({ id: numberId })
          .update({
            current_bid: amount,
            current_bid_user_id: userId,
            updated_at: db.fn.now()
          });
        console.log('更新号码最高价成功');
        
        // ⭐ 更新产品表的当前价格（取所有号码的最高出价）
        const maxBid = await trx('numbers')
          .where({ product_id: productId })
          .max('current_bid as max')
          .first();
        
        const newProductPrice = maxBid?.max || product.base_price;
        await trx('products')
          .where({ id: productId })
          .update({
            current_price: newProductPrice,
            updated_at: db.fn.now()
          });
        console.log(`更新产品价格成功: ${newProductPrice}`);
        
        // 更新之前 winning 状态
        await trx('bids')
          .where({ number_id: numberId, is_winning: true })
          .whereNot({ id: bid.id })
          .update({ is_winning: false });
        console.log('更新 winning 状态成功');
        
        await trx.commit();
        console.log('事务提交成功');
        
        // 5. WebSocket 广播（产品级房间）
        const io = getIO();
        io.to(`product:${productId}`).emit('bid:new', {
          productId: productId,
          numberId: numberId,
          amount: amount,
          userId: userId,
          timestamp: new Date()
        });
        console.log(`📢 广播新出价到产品房间 product:${productId}，号码 ${numberId}，价格 ¥${amount}`);
        
        // 6. 被超越通知（带邮件模拟）
        if (previousHighestBidder && previousHighestBidder !== userId) {
          // 获取被超越用户的信息
          const outbidUser = await db('users').where({ id: previousHighestBidder }).first();
          
          // 创建通知记录
          await db('notifications').insert({
            user_id: previousHighestBidder,
            product_id: productId,
            type: 'outbid',
            content: `您对号码 ${number.number} 的出价 ${number.current_bid} 已被超越`,
            sent_at: db.fn.now(),
            email_sent: true
          });
          
          // 模拟发送邮件
          console.log(`\n📧 ========== 模拟邮件 ==========`);
          console.log(`收件人: ${outbidUser?.email}`);
          console.log(`主题: 【拍卖系统】竞价被超越提醒`);
          console.log(`内容: 尊敬的用户，您对产品“${product.name}”号码“${number.number}”的出价 ¥${number.current_bid} 已被超越。`);
          console.log(`新出价: ¥${amount}`);
          console.log(`================================\n`);
          
          // 发送 WebSocket 广播到产品房间
          io.to(`product:${productId}`).emit('bid:outbid', {
            productId: productId,
            numberId: numberId,
            oldAmount: number.current_bid,
            newAmount: amount,
            number: number.number
          });
          console.log(`📢 发送被超越通知到产品房间 product:${productId}，用户: ${previousHighestBidder}`);
        }
        
        return {
          success: true,
          bid: {
            id: bid.id,
            amount: Number(bid.amount),
            created_at: bid.created_at
          },
          number: {
            id: numberId,
            number: number.number,
            current_bid: amount
          },
          product: {
            id: productId,
            current_price: newProductPrice
          }
        };
      } catch (err) {
        await trx.rollback();
        throw err;
      }
    } finally {
      // 释放锁
      try {
        const currentLock = await redisGet(lockKey);
        if (currentLock === lockValue) {
          await redisDel(lockKey);
          console.log('锁已释放');
        }
      } catch (err) {
        console.error('释放锁失败:', err);
      }
    }
  },
  
  async getBidsByNumber(numberId: string) {
    console.log('获取号码出价记录:', numberId);
    const bids = await db('bids')
      .where({ number_id: numberId })
      .orderBy('created_at', 'desc')
      .limit(50)
      .select('id', 'user_id', 'amount', 'created_at', 'is_winning');
    
    return bids;
  },
  
  async getNumberInfo(numberId: string) {
    const number = await db('numbers')
      .where({ id: numberId })
      .first();
    return number;
  }
};