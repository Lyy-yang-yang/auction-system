require('dotenv').config();
const { Client } = require('pg');

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function check() {
  try {
    await client.connect();
    const res = await client.query("SELECT email, role FROM users WHERE email = 'test@example.com'");
    if (res.rows.length > 0) {
      console.log('用户:', res.rows[0]);
      if (res.rows[0].role !== 'admin') {
        await client.query("UPDATE users SET role = 'admin' WHERE email = 'test@example.com'");
        console.log('✅ 已将该用户设为管理员');
      }
    } else {
      console.log('❌ 用户不存在');
    }
  } catch (err) {
    console.error('错误:', err.message);
  } finally {
    await client.end();
  }
}

check();