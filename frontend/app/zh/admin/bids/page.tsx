'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Bid {
  id: string;
  amount: number;
  created_at: string;
  user_email: string;
  product_name: string;
}

export default function AdminBidsPage() {
  const router = useRouter();
  const [bids, setBids] = useState<Bid[]>([]);
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

  const fetchBids = async () => {
    if (!token) return;
    try {
      let url = 'http://localhost:5000/api/admin/bids';
      if (filterProduct) {
        url += `?productId=${filterProduct}`;
      }
      const res = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setBids(data.data);
      }
    } catch (error) {
      console.error('获取竞价记录失败:', error);
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
      fetchBids();
      fetchProducts();
    }
  }, [token, filterProduct]);

  if (loading) {
    return <div className="text-center py-8">加载中...</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">竞价记录</h1>

      {/* 筛选 */}
      <div className="mb-4">
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">出价时间</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">用户邮箱</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">产品名称</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">出价金额</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {bids.map((bid) => (
              <tr key={bid.id}>
                <td className="px-6 py-4">{new Date(bid.created_at).toLocaleString('zh-CN')}</td>
                <td className="px-6 py-4">{bid.user_email}</td>
                <td className="px-6 py-4">{bid.product_name}</td>
                <td className="px-6 py-4">¥{bid.amount}</td>
              </tr>
            ))}
            {bids.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                  暂无竞价记录
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}