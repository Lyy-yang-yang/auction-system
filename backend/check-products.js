require('dotenv').config();
const { Client } = require('pg');

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function check() {
  await client.connect();
  const res = await client.query('SELECT id, name, current_price, status FROM products');
  console.log('产品列表:');
  res.rows.forEach(row => {
    console.log('  ID: ' + row.id + ', 名称: ' + row.name + ', 价格: ' + row.current_price + ', 状态: ' + row.status);
  });
  await client.end();
}

check();