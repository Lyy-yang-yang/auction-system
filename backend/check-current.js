require('dotenv').config();
const { Client } = require('pg');

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function check() {
  await client.connect();
  
  // 查看产品
  const product = await client.query(
    'SELECT id, name, current_price FROM products WHERE id = $1',
    ['b7d0bf91-943b-487f-bf79-e09b0f031e40']
  );
  console.log('产品信息:', product.rows[0]);
  
  // 查看号码
  const numbers = await client.query(
    'SELECT number, current_bid, current_bid_user_id, status FROM numbers WHERE product_id = $1 ORDER BY number',
    ['b7d0bf91-943b-487f-bf79-e09b0f031e40']
  );
  console.log('\n号码状态:');
  numbers.rows.forEach(row => {
    console.log(`  号码 ${row.number}: 当前价 ${row.current_bid || '-'}, 状态 ${row.status}`);
  });
  
  await client.end();
}

check();