import db from './config/database';
import { getIO } from './config/socket';

let isRunning = false;

async function settleExpiredNumbers() {
  if (isRunning) {
    console.log('⏳ 结算任务已在运行，跳过本次');
    return;
  }
  
  isRunning = true;
  console.log('🔍 开始检查过期号码...');
  
  try {
    // 1. 获取所有已过期的产品
    const expiredProducts = await db('products')
      .where('bid_end_time', '<', db.fn.now())
      .andWhere('status', 'active');
    
    if (expiredProducts.length === 0) {
      console.log('📭 没有过期产品');
      isRunning = false;
      return;
    }
    
    console.log(`📦 找到 ${expiredProducts.length} 个过期产品`);
    
    for (const product of expiredProducts) {
      console.log(`\n🎯 处理产品: ${product.name} (${product.id})`);
      
      // 获取该产品下所有号码
      const numbers = await db('numbers')
        .where({ product_id: product.id })
        .whereNot('status', 'sold');
      
      let soldCount = 0;
      
      for (const number of numbers) {
        // 查询该号码的最高出价
        const highestBid = await db('bids')
          .where({ number_id: number.id })
          .orderBy('amount', 'desc')
          .first();
        
        if (highestBid) {
          // 获取赢家用户信息
          const winnerUser = await db('users').where({ id: highestBid.user_id }).first();
          
          // 模拟发送邮件 - 赢家
          console.log(`\n📧 ========== 模拟邮件 ==========`);
          console.log(`收件人: ${winnerUser?.email}`);
          console.log(`主题: 【拍卖系统】竞拍成功通知`);
          console.log(`内容: 恭喜！您以 ¥${highestBid.amount} 的价格成功拍得号码 ${number.number}`);
          console.log(`================================\n`);
          
          // 标记为已售
          await db('numbers')
            .where({ id: number.id })
            .update({
              status: 'sold',
              winner_user_id: highestBid.user_id,
              final_price: highestBid.amount,
              updated_at: db.fn.now()
            });
          
          soldCount++;
          console.log(`  ✅ 号码 ${number.number} 已售，赢家: ${highestBid.user_id}，价格: ¥${highestBid.amount}`);
          
          // 创建赢家通知
          await db('notifications').insert({
            user_id: highestBid.user_id,
            product_id: product.id,
            type: 'auction_won',
            content: `恭喜！您以 ¥${highestBid.amount} 的价格拍得号码 ${number.number}`,
            sent_at: db.fn.now(),
            email_sent: true
          });
          
          // 通知其他出价者
          const otherBidders = await db('bids')
            .where({ number_id: number.id })
            .whereNot('user_id', highestBid.user_id)
            .distinct('user_id');
          
          for (const bidder of otherBidders) {
            const loserUser = await db('users').where({ id: bidder.user_id }).first();
            
            // 模拟发送邮件 - 输家
            console.log(`\n📧 ========== 模拟邮件 ==========`);
            console.log(`收件人: ${loserUser?.email}`);
            console.log(`主题: 【拍卖系统】竞拍失败通知`);
            console.log(`内容: 很遗憾，您对号码 ${number.number} 的出价未能获胜。最终成交价: ¥${highestBid.amount}`);
            console.log(`================================\n`);
            
            await db('notifications').insert({
              user_id: bidder.user_id,
              product_id: product.id,
              type: 'auction_lost',
              content: `很遗憾，号码 ${number.number} 已被其他用户以 ¥${highestBid.amount} 拍得`,
              sent_at: db.fn.now(),
              email_sent: true
            });
          }
          
          // WebSocket 广播
          const io = getIO();
          io.to(`product:${product.id}`).emit('number:status', {
            productId: product.id,
            numberId: number.id,
            number: number.number,
            status: 'sold',
            winnerId: highestBid.user_id,
            price: highestBid.amount
          });
        } else {
          // 无出价：标记为未售
          await db('numbers')
            .where({ id: number.id })
            .update({
              status: 'unsold',
              updated_at: db.fn.now()
            });
          console.log(`  ⏸️ 号码 ${number.number} 无人出价，未售出`);
        }
      }
      
      // 更新产品状态为已结束
      await db('products')
        .where({ id: product.id })
        .update({
          status: 'ended',
          updated_at: db.fn.now()
        });
      
      // 更新产品的可用库存为已售号码数量
      await db('products')
        .where({ id: product.id })
        .update({
          available_stock: soldCount
        });
      
      console.log(`📊 产品 ${product.name} 结算完成，已售 ${soldCount}/${product.total_stock} 个号码`);
      
      // 广播产品结束事件
      const io = getIO();
      io.to(`product:${product.id}`).emit('auction:end', {
        productId: product.id,
        productName: product.name
      });
    }
    
    console.log('✅ 结算任务完成\n');
  } catch (error) {
    console.error('❌ 结算任务出错:', error);
  } finally {
    isRunning = false;
  }
}

// 启动定时任务（每30秒执行一次）
export function startScheduler() {
  console.log('⏰ 定时结算任务已启动（每30秒检查一次）');
  
  // 立即执行一次
  settleExpiredNumbers();
  
  // 每30秒执行一次
  setInterval(() => {
    settleExpiredNumbers();
  }, 30000);
}