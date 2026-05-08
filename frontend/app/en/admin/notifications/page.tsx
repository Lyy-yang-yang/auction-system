'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Notification {
  id: string;
  type: string;
  content: string;
  is_read: boolean;
  sent_at: string;
  user_email: string;
  email_sent: boolean;
}

export default function AdminNotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (!storedToken) {
      router.push('/en');
      return;
    }
    setToken(storedToken);
  }, [router]);

  const fetchNotifications = async () => {
    if (!token) return;
    try {
      const res = await fetch('http://localhost:5000/api/admin/notifications', {
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

  useEffect(() => {
    if (token) {
      fetchNotifications();
    }
  }, [token]);

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'outbid': return 'Outbid';
      case 'auction_won': return 'Auction Won';
      case 'auction_ended': return 'Auction Ended';
      case 'auction_lost': return 'Auction Lost';
      default: return type;
    }
  };

  const translateContent = (content: string): string => {
    try {
      // Auction Won
      if (content.includes('恭喜')) {
        const numMatch = content.match(/号码\s*(\d+)/);
        const priceMatch = content.match(/[￥¥]\s*([\d.]+)/);
        if (numMatch && priceMatch) {
          return `Congratulations! You won number ${numMatch[1]} with ¥${priceMatch[1]}`;
        }
        return content;
      }
      // Auction Lost
      if (content.includes('很遗憾')) {
        const numMatch = content.match(/号码\s*(\d+)/);
        const priceMatch = content.match(/[￥¥]\s*([\d.]+)/);
        if (numMatch && priceMatch) {
          return `Unfortunately, number ${numMatch[1]} was won by another user with ¥${priceMatch[1]}`;
        }
        return content;
      }
      // Outbid - 匹配多种格式
      if (content.includes('已被超越') || content.includes('出价') || content.includes('超越')) {
        // 提取号码
        let numMatch = content.match(/号码\s*(\d+)/);
        if (!numMatch) {
          numMatch = content.match(/[号對]\s*[码話]\s*(\d+)/);
        }
        if (!numMatch) {
          numMatch = content.match(/(\d+)\s*号/);
        }
        // 提取价格
        let priceMatch = content.match(/[￥¥]\s*([\d.]+)/);
        if (!priceMatch) {
          priceMatch = content.match(/(\d+\.?\d*)\s*元/);
        }
        if (!priceMatch) {
          priceMatch = content.match(/(\d+\.?\d*)/);
        }
        if (numMatch && priceMatch) {
          return `Your bid of ¥${priceMatch[1]} on number ${numMatch[1]} has been outbid`;
        }
        return content;
      }
      return content;
    } catch (e) {
      return content;
    }
  };

  if (loading) return <div className="text-center py-8">Loading...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Notification Records</h1>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-[800px] md:min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User Email</th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Content</th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email Status</th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sent Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {notifications.map((notif) => (
                <tr key={notif.id}>
                  <td className="px-4 sm:px-6 py-4 text-sm">{notif.user_email}</td>
                  <td className="px-4 sm:px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs ${
                      notif.type === 'outbid' ? 'bg-yellow-100 text-yellow-800' :
                      notif.type === 'auction_won' ? 'bg-green-100 text-green-800' :
                      notif.type === 'auction_lost' ? 'bg-red-100 text-red-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {getTypeLabel(notif.type)}
                    </span>
                  </td>
                  <td className="px-4 sm:px-6 py-4 text-sm">{translateContent(notif.content)}</td>
                  <td className="px-4 sm:px-6 py-4">
                    {notif.email_sent ? (
                      <span className="text-green-600">📧 Sent</span>
                    ) : (
                      <span className="text-gray-400">⏳ Pending</span>
                    )}
                  </td>
                  <td className="px-4 sm:px-6 py-4 text-sm">{new Date(notif.sent_at).toLocaleString('en-US')}</td>
                </tr>
              ))}
              {notifications.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">No notifications found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}