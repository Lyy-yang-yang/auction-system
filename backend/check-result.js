require('dotenv').config();
const { Client } = require('pg');

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function check() {
  await client.connect();
  
  // 查看号码状态
  const numbers = await client.query(
    'SELECT number, status, winner_user_id, final_price FROM numbers WHERE product_id = $1 ORDER BY number',
    ['b7d0bf91-943b-487f-bf79-e09b0f031e40']
  );
  console.log('号码结算结果:');
  numbers.rows.forEach(row => {
    const priceInfo = row.final_price ? `, 成交价 ¥${row.final_price}` : '';
    console.log(`  号码 ${row.number}: ${row.status}${priceInfo}`);
  });
  
  // 查看通知
  const notifications = await client.query(
    'SELECT type, content FROM notifications ORDER BY created_at DESC LIMIT 5'
  );
  console.log('\n最近通知:');
  notifications.rows.forEach(row => {
    console.log(`  ${row.type}: ${row.content}`);
  });
  
  await client.end();
}

check();