import db from '../../config/database';
import { getIO } from '../../config/socket';

export const numberService = {
 async getNumbersByProduct(productId: string) {
  const numbers = await db('numbers')
    .where({ product_id: productId })
    .orderBy('number', 'asc')
    .select('id', 'number', 'status', 'user_id', 'reserved_at', 'current_bid', 'current_bid_user_id');
  
  return numbers;
},

  async selectNumber(productId: string, numberId: string, userId: string) {
    const trx = await db.transaction();
    
    try {
      const number = await trx('numbers')
        .where({ id: numberId, product_id: productId })
        .first();
      
      if (!number) {
        throw new Error('号码不存在');
      }
      
      if (number.status !== 'available') {
        throw new Error('号码已被选');
      }
      
      // 更新号码状态
      await trx('numbers')
        .where({ id: numberId })
        .update({
          status: 'reserved',
          user_id: userId,
          reserved_at: db.fn.now(),
          updated_at: db.fn.now()
        });
      
      // 更新产品可用库存
      await trx('products')
        .where({ id: productId })
        .decrement('available_stock', 1);
      
      await trx.commit();
      
      // 广播号码状态变化
      const io = getIO();
      io.to(`product:${productId}`).emit('number:status', {
        productId: productId,
        numberId: numberId,
        number: number.number,
        status: 'reserved',
        userId: userId
      });
      console.log(`📢 广播号码状态变化: 产品 ${productId} 的号码 ${number.number} 已被用户 ${userId} 选择`);
      
      return { success: true, message: '号码选择成功' };
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  }
};