require('dotenv').config();
const { Client } = require('pg');

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function addColumn() {
  try {
    await client.connect();
    await client.query("ALTER TABLE notifications ADD COLUMN IF NOT EXISTS email_sent BOOLEAN DEFAULT FALSE");
    console.log('✅ email_sent 列添加成功');
  } catch (err) {
    console.error('错误:', err.message);
  } finally {
    await client.end();
  }
}

addColumn();