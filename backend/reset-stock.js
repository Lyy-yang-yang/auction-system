require('dotenv').config();
const { Client } = require('pg');

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function resetStock() {
  try {
    await client.connect();
    
    // 重置产品库存
    await client.query("UPDATE products SET available_stock = total_stock WHERE id = 'fbee9416-9e41-46f1-840e-38d339039aa2'");
    console.log('✅ 产品库存已重置');
    
    // 重置号码状态
    await client.query("UPDATE numbers SET status = 'available', user_id = NULL, reserved_at = NULL WHERE product_id = 'fbee9416-9e41-46f1-840e-38d339039aa2'");
    console.log('✅ 号码状态已重置，所有号码恢复为可选状态');
    
  } catch (err) {
    console.error('错误:', err.message);
  } finally {
    await client.end();
  }
}

resetStock();