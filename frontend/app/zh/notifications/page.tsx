'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Notification {
  id: string;
  type: string;
  content: string;
  is_read: boolean;
  sent_at: string;
  product_id: string;
  product_name?: string;
}

export default function MyNotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (!storedToken) {
      router.push('/zh/login');
      return;
    }
    setToken(storedToken);
    try {
      const payload = JSON.parse(atob(storedToken.split('.')[1]));
      setUserId(payload.userId);
    } catch {}
  }, [router]);

  const fetchNotifications = async () => {
    if (!token || !userId) return;
    try {
      const res = await fetch(`http://localhost:5000/api/users/${userId}/notifications`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setNotifications(data.data);
      }
    } catch (error) {
      console.error('获取通知失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await fetch(`http://localhost:5000/api/notifications/${id}/read`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setNotifications(prev => prev.map(n => 
        n.id === id ? { ...n, is_read: true } : n
      ));
    } catch (error) {
      console.error('标记已读失败:', error);
    }
  };

  useEffect(() => {
    if (token && userId) {
      fetchNotifications();
    }
  }, [token, userId]);

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'outbid': return '被超越';
      case 'auction_won': return '🎉 竞拍成功';
      case 'auction_lost': return '😔 竞拍失败';
      case 'auction_ended': return '拍卖结束';
      default: return type;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'auction_won': return 'bg-green-100 text-green-800 border-green-300';
      case 'auction_lost': return 'bg-red-100 text-red-800 border-red-300';
      case 'outbid': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-8">加载中...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">📬 我的通知</h1>
        <Link href="/zh" className="text-blue-600 hover:underline">
          ← 返回首页
        </Link>
      </div>

      {notifications.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center text-gray-500">
          📭 暂无通知
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              className={`bg-white rounded-lg shadow-md p-4 border-l-4 ${getTypeColor(notif.type)} ${notif.is_read ? 'opacity-75' : ''}`}
              onClick={() => !notif.is_read && markAsRead(notif.id)}
              style={{ cursor: !notif.is_read ? 'pointer' : 'default' }}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs px-2 py-1 rounded ${getTypeColor(notif.type)}`}>
                      {getTypeLabel(notif.type)}
                    </span>
                    {!notif.is_read && (
                      <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">新</span>
                    )}
                  </div>
                  <p className="text-gray-700">{notif.content}</p>
                  <p className="text-xs text-gray-400 mt-2">
                    {new Date(notif.sent_at).toLocaleString('zh-CN')}
                  </p>
                </div>
                {notif.type === 'auction_won' && notif.product_id && (
                  <Link
                    href={`/zh/product/${notif.product_id}`}
                    className="text-blue-600 hover:text-blue-800 text-sm ml-4"
                    onClick={(e) => e.stopPropagation()}
                  >
                    查看详情 →
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}