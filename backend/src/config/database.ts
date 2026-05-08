import knex from 'knex';
import dotenv from 'dotenv';

dotenv.config();

const db = knex({
  client: 'pg',
  connection: {
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  },
  pool: { min: 2, max: 10 }
});

// 自动创建表（如果不存在）
async function initializeDatabase() {
  try {
    const hasUsersTable = await db.schema.hasTable('users');
    
    if (!hasUsersTable) {
      console.log('📝 Creating users table...');
      await db.schema.createTable('users', (table) => {
        table.uuid('id').primary().defaultTo(db.raw('gen_random_uuid()'));
        table.string('email').unique().notNullable();
        table.string('password').notNullable();
        table.string('username').unique().notNullable();
        table.timestamp('created_at').defaultTo(db.fn.now());
        table.timestamp('updated_at').defaultTo(db.fn.now());
      });
      console.log('✅ Users table created successfully!');
    } else {
      console.log('✅ Users table already exists');
    }
  } catch (error) {
    console.error('❌ Database initialization error:', error);
  }
}

// 执行初始化
initializeDatabase();

export default db;