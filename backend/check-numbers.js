require('dotenv').config();
const { Client } = require('pg');

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function check() {
  await client.connect();
  const res = await client.query("SELECT number, current_bid, current_bid_user_id, status FROM numbers WHERE product_id = 'b7d0bf91-943b-487f-bf79-e09b0f031e40' ORDER BY number");
  console.log('号码数据:');
  res.rows.forEach(row => {
    console.log(`  号码 ${row.number}: 当前价 ${row.current_bid}, 状态 ${row.status}, 用户 ${row.current_bid_user_id}`);
  });
  await client.end();
}

check();