require('dotenv').config();
const { Client } = require('pg');

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function setAdmin() {
  try {
    await client.connect();
    const res = await client.query("UPDATE users SET role = 'admin' WHERE email = 'test@example.com' RETURNING email, role");
    if (res.rows.length > 0) {
      console.log('✅ 用户 ' + res.rows[0].email + ' 已设置为管理员');
    } else {
      console.log('❌ 用户不存在');
    }
  } catch (err) {
    console.error('错误:', err.message);
  } finally {
    await client.end();
  }
}

setAdmin();