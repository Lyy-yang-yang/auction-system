'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    console.log('AdminLayout - token:', token ? '存在' : '不存在');
    
    if (!token) {
      console.log('无token，跳转到首页');
      router.replace('/zh');
      return;
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      console.log('JWT payload:', payload);
      console.log('用户角色:', payload.role);
      
      if (payload.role === 'admin') {
        console.log('管理员权限验证通过');
        setIsAdmin(true);
      } else {
        console.log('非管理员，跳转到首页');
        router.replace('/zh');
      }
    } catch (err) {
      console.error('解析token失败:', err);
      router.replace('/zh');
    } finally {
      setLoading(false);
    }
  }, [router]);

  const navItems = [
    { href: '/zh/admin/products', label: '产品管理', icon: '📦' },
    { href: '/zh/admin/orders', label: '订单管理', icon: '🛒' },
    { href: '/zh/admin/bids', label: '竞价记录', icon: '💰' },
    { href: '/zh/admin/notifications', label: '通知记录', icon: '🔔' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-gray-500">验证权限中...</div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* 左侧边栏 */}
      <aside className="w-64 bg-white shadow-md flex flex-col">
        <div className="p-4 border-b">
          <h1 className="text-xl font-bold text-blue-600">管理后台</h1>
        </div>
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-2 rounded-lg transition ${
                      isActive
                        ? 'bg-blue-50 text-blue-600'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>

      {/* 右侧内容区 */}
      <main className="flex-1 overflow-y-auto p-6">
        {children}
      </main>
    </div>
  );
}