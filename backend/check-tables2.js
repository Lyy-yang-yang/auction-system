require('dotenv').config();
const { Client } = require('pg');

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function check() {
  try {
    await client.connect();
    const res = await client.query("SELECT table_name FROM information_schema.tables WHERE table_name IN ('bids', 'notifications')");
    console.log('已存在的表:', res.rows.map(r => r.table_name));
  } catch (err) {
    console.error('错误:', err.message);
  } finally {
    await client.end();
  }
}

check();