require('dotenv').config();
const { Client } = require('pg');

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function check() {
  await client.connect();
  const res = await client.query("SELECT name, bid_end_time FROM products WHERE name = '幸运号码001'");
  console.log('数据库中的结束时间:', res.rows[0].bid_end_time);
  console.log('当前服务器时间:', new Date().toISOString());
  await client.end();
}

check();