'use client';
import { useEffect, useRef, useState, useCallback } from 'react';
import io, { Socket } from 'socket.io-client';

interface UseSocketOptions {
  userId?: string | null;
  productId?: string | null;
  numberId?: string | null;
  onNewBid?: (data: any) => void;
  onOutbid?: (data: any) => void;
  onNumberStatusChange?: (data: any) => void;
}

export const useSocket = ({
  userId,
  productId,
  numberId,
  onNewBid,
  onOutbid,
  onNumberStatusChange,
}: UseSocketOptions) => {
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const isConnecting = useRef(false);

  // 关键：只在组件首次挂载和最后卸载时连接/断开
  useEffect(() => {
    // 防止重复连接
    if (socketRef.current || isConnecting.current) {
      console.log('⚠️ 已存在连接或正在连接，跳过');
      return;
    }
    isConnecting.current = true;
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:5000';
    console.log('🔄 创建 WebSocket 连接...');
    const socket = io(wsUrl, {
      path: '/socket.io/',
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('🔌 WebSocket 已连接:', socket.id);
      setIsConnected(true);
      isConnecting.current = false;
      if (userId) {
        socket.emit('register', userId);
        console.log('📝 注册用户:', userId);
      }
      if (productId) {
        socket.emit('join:product', productId);
        console.log('📢 加入产品房间:', productId);
      }
      if (numberId) {
        socket.emit('join:number', numberId);
        console.log('📢 加入号码房间:', numberId);
      }
    });

    socket.on('disconnect', (reason) => {
      console.log('🔌 WebSocket 断开:', reason);
      setIsConnected(false);
    });

    socket.on('connect_error', (error) => {
      console.error('❌ WebSocket 连接错误:', error.message);
      isConnecting.current = false;
    });

    socket.on('bid:new', (data: any) => {
      console.log('📩 收到 bid:new:', data);
      if (onNewBid) onNewBid(data);
    });
    socket.on('bid:outbid', (data: any) => {
      console.log('📩 收到 bid:outbid:', data);
      if (onOutbid) onOutbid(data);
    });
    socket.on('number:status', (data: any) => {
      console.log('📩 收到 number:status:', data);
      if (onNumberStatusChange) onNumberStatusChange(data);
    });

    return () => {
      console.log('🧹 清理 WebSocket 连接');
      if (socketRef.current) {
        socketRef.current.off('bid:new');
        socketRef.current.off('bid:outbid');
        socketRef.current.off('number:status');
        socketRef.current.disconnect();
        socketRef.current = null;
        isConnecting.current = false;
      }
    };
  }, []); // 空依赖数组，确保只执行一次

  // 处理 userId/productId/numberId 变化时更新房间（不重建连接）
  const prevProps = useRef({ userId, productId, numberId });
  useEffect(() => {
    const socket = socketRef.current;
    if (!socket || !socket.connected) return;
    const prev = prevProps.current;

    if (userId !== prev.userId && userId) {
      socket.emit('register', userId);
      console.log('📝 更新注册用户:', userId);
    }
    if (productId !== prev.productId) {
      if (prev.productId) {
        socket.emit('leave:product', prev.productId);
        console.log('📢 离开产品房间:', prev.productId);
      }
      if (productId) {
        socket.emit('join:product', productId);
        console.log('📢 加入产品房间:', productId);
      }
    }
    if (numberId !== prev.numberId) {
      if (prev.numberId) {
        socket.emit('leave:number', prev.numberId);
        console.log('📢 离开号码房间:', prev.numberId);
      }
      if (numberId) {
        socket.emit('join:number', numberId);
        console.log('📢 加入号码房间:', numberId);
      }
    }
    prevProps.current = { userId, productId, numberId };
  }, [userId, productId, numberId]);

  return {
    socket: socketRef.current,
    isConnected,
  };
};