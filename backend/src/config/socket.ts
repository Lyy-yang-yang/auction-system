import { Server as HttpServer } from 'http';
import { Server as SocketServer } from 'socket.io';

let io: SocketServer;

// 用户 socket 映射
export const userSockets = new Map<string, string>(); // userId -> socketId

export function initSocket(httpServer: HttpServer) {
  io = new SocketServer(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  });
  
  io.on('connection', (socket) => {
    console.log('🔌 新客户端连接:', socket.id);
    
    // 用户注册（登录后调用）
    socket.on('register', (userId: string) => {
      userSockets.set(userId, socket.id);
      console.log(`📝 用户 ${userId} 已注册，socket: ${socket.id}`);
    });
    
    // 加入产品房间
    socket.on('join:product', (productId: string) => {
      socket.join(`product:${productId}`);
      console.log(`📢 Socket ${socket.id} 加入产品房间: product:${productId}`);
    });
    
    // 离开产品房间
    socket.on('leave:product', (productId: string) => {
      socket.leave(`product:${productId}`);
    });
    
    // 用户个人房间（用于私信）
    socket.on('join:user', (userId: string) => {
      socket.join(`user:${userId}`);
    });
    
    socket.on('disconnect', () => {
      console.log('🔌 客户端断开:', socket.id);
      // 清理映射
      for (const [userId, socketId] of userSockets.entries()) {
        if (socketId === socket.id) {
          userSockets.delete(userId);
          break;
        }
      }
    });
  });
  
  return io;
}

export function getIO() {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
}