require('dotenv').config();
const { Client } = require('pg');

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function updateTime() {
  try {
    await client.connect();
    
    const twoMinutesLater = new Date();
    twoMinutesLater.setMinutes(twoMinutesLater.getMinutes() + 2);
    
    await client.query(
      'UPDATE products SET bid_end_time = $1 WHERE id = $2',
      [twoMinutesLater.toISOString(), 'b7d0bf91-943b-487f-bf79-e09b0f031e40']
    );
    
    console.log('✅ 产品结束时间已更新为2分钟后:', twoMinutesLater.toLocaleString());
  } catch (err) {
    console.error('错误:', err.message);
  } finally {
    await client.end();
  }
}

updateTime();