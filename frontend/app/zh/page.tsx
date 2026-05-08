'use client';

import { useEffect, useState } from 'react';
import io from 'socket.io-client';

interface Product {
  id: string;
  name: string;
  description: string;
  image_url: string;
  base_price: number;
  current_price: number;
  available_stock: number;
  total_stock: number;
  min_bid_increment: number;
  bid_end_time: string;
  status: string;
}

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/products`);
      const data = await res.json();
      if (data.success) {
        setProducts(data.data);
      }
    } catch (error) {
      console.error('获取产品失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    const socket = io('http://localhost:5000');
    socket.on('bid:new', () => setTimeout(() => fetchProducts(), 500));
    socket.on('bid:outbid', () => setTimeout(() => fetchProducts(), 500));
    return () => socket.disconnect();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white rounded-lg shadow-md p-4 animate-pulse">
              <div className="h-48 bg-gray-200 rounded mb-4"></div>
              <div className="h-4 bg-gray-200 rounded mb-2 w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">🔥 热门拍卖</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <a
            key={product.id}
            href={`/zh/product/${product.id}`}
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow h-full flex flex-col"
          >
            {/* 固定高度图片区 */}
            <div className="h-48 bg-gray-200 flex items-center justify-center flex-shrink-0">
              {product.image_url ? (
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-gray-400">📦 暂无图片</span>
              )}
            </div>
            
            {/* 内容区 - 自适应高度 */}
            <div className="p-4 flex flex-col flex-1">
              <h2 className="text-xl font-semibold mb-2 line-clamp-1">{product.name}</h2>
              <p className="text-gray-600 text-sm mb-3 line-clamp-2 flex-1">
                {product.description || '暂无描述'}
              </p>
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-500">当前价格</span>
                <span className="text-2xl font-bold text-red-600">
                  ¥{product.current_price || product.base_price}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm text-gray-500">
                <span>加价幅度: ¥{product.min_bid_increment}</span>
                <span>库存: {product.available_stock}/{product.total_stock}</span>
              </div>
              {product.status === 'active' ? (
                <div className="mt-3 text-green-600 text-sm">🔥 进行中</div>
              ) : (
                <div className="mt-3 text-gray-400 text-sm">⏰ 已结束</div>
              )}
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}