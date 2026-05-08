import express from 'express';
import http from 'http';
import { initSocket } from './config/socket';
import bidRoutes from './modules/bid/bid.routes';
import cors from 'cors';
import dotenv from 'dotenv';
import db from './config/database';
import authRoutes from './routes/authRoutes';
import productRoutes from './modules/product/product.routes';
import numberRoutes from './modules/number/number.routes';
import adminRoutes from './modules/admin/admin.routes';
import { startScheduler } from './scheduler';

// 加载环境变量
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 路由
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api', numberRoutes);
app.use('/api', bidRoutes);
app.use('/api', adminRoutes);

// 测试数据库连接
app.get('/api/health', async (req, res) => {
  try {
    await db.raw('SELECT 1');
    res.json({ 
      status: 'OK', 
      message: 'Server and database are running!',
      timestamp: new Date().toISOString(),
      database: 'Connected ✅'
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'ERROR', 
      message: 'Database connection failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// 404 处理
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// 创建 HTTP 服务器
const server = http.createServer(app);

// 初始化 WebSocket
const io = initSocket(server);
app.set('io', io);

// 启动服务器
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📦 Database: ${process.env.DATABASE_URL ? '✅ Configured' : '❌ Missing'}`);
  console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔌 WebSocket: ✅ Ready`);
});

// 启动定时结算任务
startScheduler();

export default app;