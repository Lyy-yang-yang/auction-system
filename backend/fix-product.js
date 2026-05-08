require('dotenv').config();
const { Client } = require('pg');

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function fix() {
  await client.connect();
  await client.query("UPDATE products SET available_stock = 0 WHERE id = 'b7d0bf91-943b-487f-bf79-e09b0f031e40'");
  console.log('✅ 产品库存已设为 0');
  await client.end();
}

fix();