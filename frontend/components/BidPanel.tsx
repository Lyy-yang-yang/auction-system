'use client';

import { useState, useEffect } from 'react';

interface BidPanelProps {
  productId: string;
  currentPrice: number;
  minIncrement: number;
  token: string | null;
  onBidSuccess?: (newPrice: number) => void;
}

interface BidRecord {
  id: string;
  user_id: string;
  amount: number;
  created_at: string;
  is_winning: boolean;
}

export default function BidPanel({ productId, currentPrice, minIncrement, token, onBidSuccess }: BidPanelProps) {
  const [amount, setAmount] = useState(Number(currentPrice) + Number(minIncrement));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [bids, setBids] = useState<BidRecord[]>([]);
  const [loadingBids, setLoadingBids] = useState(true);

  const minBid = Number(currentPrice) + Number(minIncrement);

  // 获取出价记录
  const fetchBids = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/products/${productId}/bids`);
      const data = await res.json();
      if (data.success) {
        setBids(data.data);
      }
    } catch (error) {
      console.error('获取出价记录失败:', error);
    } finally {
      setLoadingBids(false);
    }
  };

  useEffect(() => {
    fetchBids();
  }, [productId]);

  // 监听出价更新事件
  useEffect(() => {
    const handleRefresh = () => {
      fetchBids();
    };
    window.addEventListener('refreshBids', handleRefresh);
    return () => window.removeEventListener('refreshBids', handleRefresh);
  }, [productId]);

  // 当 currentPrice 变化时更新金额
  useEffect(() => {
    setAmount(Number(currentPrice) + Number(minIncrement));
  }, [currentPrice, minIncrement]);

  const handleBid = async () => {
    if (!token) {
      setError('请先登录');
      return;
    }

    if (amount < minBid) {
      setError(`出价必须至少为 ¥${minBid}`);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch(`http://localhost:5000/api/products/${productId}/bids`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ amount })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        await fetchBids();
        onBidSuccess?.(amount);
        // 触发事件通知其他组件
        window.dispatchEvent(new Event('refreshBids'));
      } else {
        setError(data.error || '出价失败');
      }
    } catch (err) {
      setError('网络错误，请重试');
    } finally {
      setLoading(false);
    }
  };

  // 格式化时间
  const formatTime = (time: string) => {
    const date = new Date(time);
    return date.toLocaleString('zh-CN');
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-4">💰 出价</h2>
        <div className="mb-4">
          <div className="text-gray-600 mb-2">
            当前价格：<span className="text-2xl font-bold text-red-600">¥{currentPrice}</span>
          </div>
          <div className="text-gray-500 text-sm mb-4">
            最低出价：¥{minBid}（当前价 + 加价幅度 ¥{minIncrement}）
          </div>
          <div className="flex gap-2">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="flex-1 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              step={minIncrement}
              min={minBid}
            />
            <button
              onClick={handleBid}
              disabled={loading || !token}
              className="bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700 transition disabled:opacity-50"
            >
              {loading ? '出价中...' : '🚀 出价'}
            </button>
          </div>
          {error && <div className="mt-2 text-red-500 text-sm">{error}</div>}
          {!token && <div className="mt-2 text-yellow-600 text-sm">请先登录</div>}
        </div>
      </div>

      <div>
        <h3 className="font-semibold text-gray-700 mb-3">📋 出价记录</h3>
        {loadingBids ? (
          <div className="text-center py-4 text-gray-500">加载中...</div>
        ) : bids.length === 0 ? (
          <div className="text-center py-4 text-gray-500">暂无出价记录</div>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {bids.map((bid, index) => (
              <div
                key={bid.id}
                className={`flex justify-between items-center p-2 rounded ${
                  index === 0 ? 'bg-yellow-50 border-l-4 border-yellow-500' : 'bg-gray-50'
                }`}
              >
                <div>
                  <span className="font-medium">¥{bid.amount}</span>
                  {index === 0 && <span className="ml-2 text-xs text-yellow-600">🏆 领先</span>}
                </div>
                <div className="text-sm text-gray-500">{formatTime(bid.created_at)}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}