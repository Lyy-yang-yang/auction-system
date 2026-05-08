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
      router.push('/en/login');
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
      console.error('Failed to fetch notifications:', error);
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
      console.error('Failed to mark as read:', error);
    }
  };

  useEffect(() => {
    if (token && userId) {
      fetchNotifications();
    }
  }, [token, userId]);

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'outbid': return 'Outbid';
      case 'auction_won': return 'Won';
      case 'auction_lost': return 'Lost';
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

  const translateContent = (content: string, type: string): string => {
    // Auction Won - 匹配 "恭喜！您以 ¥200.00 的价格拍得号码 1"
    if (type === 'auction_won' || content.includes('恭喜')) {
      const match = content.match(/恭喜！您以\s*[￥¥]\s*([\d.]+)\s*的价格拍得号码\s*(\d+)/);
      if (match) {
        return `Congratulations! You won number ${match[2]} with ¥${match[1]}`;
      }
      return content;
    }
    // Auction Lost - 匹配 "很遗憾，号码 3 已被其他用户以 ¥450.00 拍得"
    if (type === 'auction_lost' || content.includes('很遗憾')) {
      const match = content.match(/很遗憾，号码\s*(\d+)\s*已被其他用户以\s*[￥¥]\s*([\d.]+)\s*拍得/);
      if (match) {
        return `Unfortunately, number ${match[1]} was won by another user with ¥${match[2]}`;
      }
      return content;
    }
    // Outbid - 匹配 "您对号码 2 的出价 350.00 已被超越"
    if (type === 'outbid' || content.includes('已被超越')) {
      const match = content.match(/您对号码\s*(\d+)\s*的出价\s*([\d.]+)\s*已被超越/);
      if (match) {
        return `Your bid of ¥${match[2]} on number ${match[1]} has been outbid`;
      }
      return content;
    }
    return content;
  };

  if (loading) {
    return <div className="container mx-auto px-4 py-8 text-center">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">📬 My Notifications</h1>
        <Link href="/en" className="text-blue-600 hover:underline">← Back to Home</Link>
      </div>

      {notifications.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center text-gray-500">
          📭 No notifications
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
                    {!notif.is_read && <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">New</span>}
                  </div>
                  <p className="text-gray-700">{translateContent(notif.content, notif.type)}</p>
                  <p className="text-xs text-gray-400 mt-2">
                    {new Date(notif.sent_at).toLocaleString('en-US')}
                  </p>
                </div>
                {notif.type === 'auction_won' && notif.product_id && (
                  <Link
                    href={`/en/product/${notif.product_id}`}
                    className="text-blue-600 hover:text-blue-800 text-sm ml-4"
                    onClick={(e) => e.stopPropagation()}
                  >
                    View Details →
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