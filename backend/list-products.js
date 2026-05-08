require('dotenv').config();
const { Client } = require('pg');

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function listProducts() {
  await client.connect();
  const res = await client.query('SELECT id, name, bid_end_time, status FROM products WHERE status = $1', ['active']);
  console.log('现有产品:');
  res.rows.forEach(row => {
    console.log(`  ID: ${row.id}, 名称: ${row.name}, 结束时间: ${row.bid_end_time}`);
  });
  await client.end();
}

listProducts();