require('dotenv').config();
const { Client } = require('pg');

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function setCorrectTime() {
  try {
    await client.connect();
    
    // 计算 5 分钟后
    const fiveMinutesLater = new Date();
    fiveMinutesLater.setMinutes(fiveMinutesLater.getMinutes() + 5);
    
    // 更新产品结束时间
    await client.query(
      "UPDATE products SET bid_end_time = $1 WHERE name = '幸运号码001'",
      [fiveMinutesLater.toISOString()]
    );
    
    console.log('✅ 已设置 5 分钟后结束');
    console.log('UTC 时间:', fiveMinutesLater.toISOString());
    console.log('北京时间:', fiveMinutesLater.toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' }));
    
    // 验证
    const res = await client.query("SELECT name, bid_end_time FROM products WHERE name = '幸运号码001'");
    console.log('验证:', res.rows[0]);
    
  } catch (err) {
    console.error('错误:', err.message);
  } finally {
    await client.end();
  }
}

setCorrectTime();