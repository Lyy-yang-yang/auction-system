'use client';

import { Inter } from 'next/font/google';
import Link from 'next/link';
import '../../app/globals.css';
import { useState, useEffect } from 'react';

const inter = Inter({ subsets: ['latin'] });

export default function ZhLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setIsAdmin(payload.role === 'admin');
      } catch {
        setIsAdmin(false);
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/zh';
  };

  return (
    <>
      <nav className="bg-white shadow-md p-4 sticky top-0 z-10">
        <div className="container mx-auto flex justify-between items-center">
          <Link href="/zh" className="text-xl font-bold text-blue-600">
            🎯 拍卖系统
          </Link>
          
          {/* 桌面端导航 */}
          <div className="hidden md:flex space-x-4">
            <Link href="/zh" className="hover:text-blue-600 transition">首页</Link>
            {!isLoggedIn ? (
              <>
                <Link href="/zh/login" className="hover:text-blue-600 transition">登录</Link>
                <Link href="/zh/register" className="hover:text-blue-600 transition">注册</Link>
              </>
            ) : (
              <>
                <Link href="/zh/notifications" className="hover:text-blue-600 transition">📬 通知</Link>
                {isAdmin && (
                  <Link href="/zh/admin/products" className="hover:text-blue-600 transition">📊 管理后台</Link>
                )}
                <Link href="/zh" className="hover:text-blue-600 transition">🏠 返回首页</Link>
                <button onClick={handleLogout} className="hover:text-blue-600 transition">退出登录</button>
                <Link href="/en" className="hover:text-blue-600 transition">English</Link>
              </>
            )}
          </div>

          {/* 移动端汉堡菜单按钮 */}
          <button
            className="md:hidden text-2xl p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            ☰
          </button>
        </div>

        {/* 移动端下拉菜单 */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pt-4 border-t flex flex-col space-y-3">
            <Link href="/zh" className="hover:text-blue-600 transition py-1" onClick={() => setMobileMenuOpen(false)}>首页</Link>
            {!isLoggedIn ? (
              <>
                <Link href="/zh/login" className="hover:text-blue-600 transition py-1" onClick={() => setMobileMenuOpen(false)}>登录</Link>
                <Link href="/zh/register" className="hover:text-blue-600 transition py-1" onClick={() => setMobileMenuOpen(false)}>注册</Link>
              </>
            ) : (
              <>
                <Link href="/zh/notifications" className="hover:text-blue-600 transition py-1" onClick={() => setMobileMenuOpen(false)}>📬 通知</Link>
                {isAdmin && (
                  <Link href="/zh/admin/products" className="hover:text-blue-600 transition py-1" onClick={() => setMobileMenuOpen(false)}>📊 管理后台</Link>
                )}
                <Link href="/zh" className="hover:text-blue-600 transition py-1" onClick={() => setMobileMenuOpen(false)}>🏠 返回首页</Link>
                <button 
                  onClick={() => { handleLogout(); setMobileMenuOpen(false); }} 
                  className="text-left hover:text-blue-600 transition py-1"
                >
                  退出登录
                </button>
                <Link href="/en" className="hover:text-blue-600 transition py-1" onClick={() => setMobileMenuOpen(false)}>English</Link>
              </>
            )}
          </div>
        )}
      </nav>
      <main className={inter.className}>{children}</main>
    </>
  );
}