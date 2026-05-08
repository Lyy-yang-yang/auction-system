require('dotenv').config();
const { Client } = require('pg');

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function fix() {
  try {
    await client.connect();
    
    // 更新产品名称为中文
    await client.query("UPDATE products SET name = '幸运号码001' WHERE name LIKE '%????%'");
    // 更新描述
    await client.query("UPDATE products SET description = '这是一个测试拍卖品' WHERE description LIKE '%????%'");
    
    console.log('✅ 中文乱码已修复');
    
    // 验证
    const res = await client.query("SELECT name, description FROM products WHERE name = '幸运号码001'");
    if (res.rows.length > 0) {
      console.log('修复后:', res.rows[0]);
    }
  } catch (err) {
    console.error('错误:', err.message);
  } finally {
    await client.end();
  }
}

fix();