'use client';

import { Inter } from 'next/font/google';
import Link from 'next/link';
import '../../app/globals.css';
import { useState, useEffect } from 'react';

const inter = Inter({ subsets: ['latin'] });

export default function EnLayout({
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
    window.location.href = '/en';
  };

  return (
    <>
      <nav className="bg-white shadow-md p-4 sticky top-0 z-10">
        <div className="container mx-auto flex justify-between items-center">
          <Link href="/en" className="text-xl font-bold text-blue-600">
            🎯 Auction System
          </Link>
          
          {/* 桌面端导航 */}
          <div className="hidden md:flex space-x-4">
            <Link href="/en" className="hover:text-blue-600 transition">Home</Link>
            {!isLoggedIn ? (
              <>
                <Link href="/en/login" className="hover:text-blue-600 transition">Login</Link>
                <Link href="/en/register" className="hover:text-blue-600 transition">Register</Link>
              </>
            ) : (
              <>
                <Link href="/en/notifications" className="hover:text-blue-600 transition">📬 Notifications</Link>
                {isAdmin && (
                  <Link href="/en/admin/products" className="hover:text-blue-600 transition">📊 Admin Panel</Link>
                )}
                <Link href="/en" className="hover:text-blue-600 transition">🏠 Back to Home</Link>
                <button onClick={handleLogout} className="hover:text-blue-600 transition">Logout</button>
                <Link href="/zh" className="hover:text-blue-600 transition">中文</Link>
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
            <Link href="/en" className="hover:text-blue-600 transition py-1" onClick={() => setMobileMenuOpen(false)}>Home</Link>
            {!isLoggedIn ? (
              <>
                <Link href="/en/login" className="hover:text-blue-600 transition py-1" onClick={() => setMobileMenuOpen(false)}>Login</Link>
                <Link href="/en/register" className="hover:text-blue-600 transition py-1" onClick={() => setMobileMenuOpen(false)}>Register</Link>
              </>
            ) : (
              <>
                <Link href="/en/notifications" className="hover:text-blue-600 transition py-1" onClick={() => setMobileMenuOpen(false)}>📬 Notifications</Link>
                {isAdmin && (
                  <Link href="/en/admin/products" className="hover:text-blue-600 transition py-1" onClick={() => setMobileMenuOpen(false)}>📊 Admin Panel</Link>
                )}
                <Link href="/en" className="hover:text-blue-600 transition py-1" onClick={() => setMobileMenuOpen(false)}>🏠 Back to Home</Link>
                <button 
                  onClick={() => { handleLogout(); setMobileMenuOpen(false); }} 
                  className="text-left hover:text-blue-600 transition py-1"
                >
                  Logout
                </button>
                <Link href="/zh" className="hover:text-blue-600 transition py-1" onClick={() => setMobileMenuOpen(false)}>中文</Link>
              </>
            )}
          </div>
        )}
      </nav>
      <main className={inter.className}>{children}</main>
    </>
  );
}