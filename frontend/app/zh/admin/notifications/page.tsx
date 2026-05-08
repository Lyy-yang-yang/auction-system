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
      router.push('/zh');
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
      console.error('获取通知记录失败:', error);
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
      case 'outbid': return '被超越';
      case 'auction_won': return '竞拍成功';
      case 'auction_ended': return '拍卖结束';
      case 'auction_lost': return '竞拍失败';
      default: return type;
    }
  };

  if (loading) {
    return <div className="text-center py-8">加载中...</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">通知记录</h1>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">用户邮箱</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">类型</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">内容</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">邮件状态</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">发送时间</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {notifications.map((notif) => (
              <tr key={notif.id}>
                <td className="px-6 py-4">{notif.user_email}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded text-xs ${
                    notif.type === 'outbid' ? 'bg-yellow-100 text-yellow-800' :
                    notif.type === 'auction_won' ? 'bg-green-100 text-green-800' :
                    notif.type === 'auction_lost' ? 'bg-red-100 text-red-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {getTypeLabel(notif.type)}
                  </span>
                </td>
                <td className="px-6 py-4">{notif.content}</td>
                <td className="px-6 py-4">
                  {notif.email_sent ? (
                    <span className="text-green-600">📧 已发送</span>
                  ) : (
                    <span className="text-gray-400">⏳ 待发送</span>
                  )}
                </td>
                <td className="px-6 py-4">{new Date(notif.sent_at).toLocaleString('zh-CN')}</td>
              </tr>
            ))}
            {notifications.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                  暂无通知记录
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}