require('dotenv').config();
const { Client } = require('pg');

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function check() {
  await client.connect();
  const res = await client.query("SELECT id, name, available_stock, total_stock FROM products WHERE id = 'b7d0bf91-943b-487f-bf79-e09b0f031e40'");
  console.log('产品库存:');
  console.log('  可用库存: ' + res.rows[0].available_stock);
  console.log('  总库存: ' + res.rows[0].total_stock);
  await client.end();
}

check();