'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Order {
  id: string;
  number: number;
  final_price: number;
  sold_at: string;
  user_email: string;
  user_name: string;
  product_name: string;
}

export default function AdminOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [filterProduct, setFilterProduct] = useState('');

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (!storedToken) {
      router.push('/zh');
      return;
    }
    setToken(storedToken);
  }, [router]);

  const fetchOrders = async () => {
    if (!token) return;
    try {
      let url = 'http://localhost:5000/api/admin/orders';
      if (filterProduct) {
        url += `?productId=${filterProduct}`;
      }
      const res = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setOrders(data.data);
      }
    } catch (error) {
      console.error('获取订单失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    if (!token) return;
    try {
      const res = await fetch('http://localhost:5000/api/products', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setProducts(data.data);
      }
    } catch (error) {
      console.error('获取产品列表失败:', error);
    }
  };

  useEffect(() => {
    if (token) {
      fetchOrders();
      fetchProducts();
    }
  }, [token, filterProduct]);

  if (loading) {
    return <div className="text-center py-8">加载中...</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">订单管理</h1>

      {/* 筛选 */}
      <div className="mb-4 flex gap-2">
        <select
          value={filterProduct}
          onChange={(e) => setFilterProduct(e.target.value)}
          className="p-2 border rounded"
        >
          <option value="">全部产品</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">产品名称</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">号码</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">用户邮箱</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">成交价</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">成交时间</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {orders.map((order) => (
              <tr key={order.id}>
                <td className="px-6 py-4">{order.product_name}</td>
                <td className="px-6 py-4">{order.number}</td>
                <td className="px-6 py-4">{order.user_email}</td>
                <td className="px-6 py-4">¥{order.final_price}</td>
                <td className="px-6 py-4">{new Date(order.sold_at).toLocaleString('zh-CN')}</td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                  暂无订单数据
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}