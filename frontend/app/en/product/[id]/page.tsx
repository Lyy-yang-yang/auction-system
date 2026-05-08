'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import CountdownTimer from '@/components/CountdownTimer';
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

interface NumberItem {
  id: string;
  number: number;
  status: 'available' | 'reserved' | 'sold';
  user_id: string | null;
  current_bid: number | null;
  current_bid_user_id: string | null;
}

export default function ProductDetailPage() {
  const params = useParams();
  const productId = params.id as string;
  
  const [product, setProduct] = useState<Product | null>(null);
  const [numbers, setNumbers] = useState<NumberItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [selectedNumber, setSelectedNumber] = useState<NumberItem | null>(null);
  const [showBidPanel, setShowBidPanel] = useState(false);
  const [bidAmount, setBidAmount] = useState('');
  const [bids, setBids] = useState<any[]>([]);
  const [loadingBids, setLoadingBids] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    setToken(storedToken);
    if (storedToken) {
      try {
        const payload = JSON.parse(atob(storedToken.split('.')[1]));
        setUserId(payload.userId);
      } catch {}
    }
  }, []);

  const fetchProduct = useCallback(async () => {
    const res = await fetch(`http://localhost:5000/api/products/${productId}`);
    const data = await res.json();
    if (data.success) setProduct(data.data);
  }, [productId]);

  const fetchNumbers = useCallback(async () => {
    const res = await fetch(`http://localhost:5000/api/products/${productId}/numbers`);
    const data = await res.json();
    if (data.success) setNumbers(data.data);
    setLoading(false);
  }, [productId]);

  const fetchBids = useCallback(async (numberId: string) => {
    setLoadingBids(true);
    const res = await fetch(`http://localhost:5000/api/products/${productId}/numbers/${numberId}/bids`);
    const data = await res.json();
    if (data.success) setBids(data.data);
    setLoadingBids(false);
  }, [productId]);

  useEffect(() => {
    if (!userId || !productId) return;
    
    console.log('🔄 Creating WebSocket connection...');
    const socket = io('http://localhost:5000');
    
    socket.on('connect', () => {
      console.log('✅ WebSocket connected');
      setIsConnected(true);
      socket.emit('register', userId);
      socket.emit('join:product', productId);
    });
    
    socket.on('disconnect', () => {
      console.log('❌ WebSocket disconnected');
      setIsConnected(false);
    });
    
    socket.on('bid:new', (data) => {
      console.log('💰 New bid received:', data);
      setNumbers(prev => prev.map(num =>
        num.id === data.numberId
          ? { ...num, current_bid: data.amount, current_bid_user_id: data.userId }
          : num
      ));
      setProduct(prev => {
        if (prev && data.amount > prev.current_price) {
          return { ...prev, current_price: data.amount };
        }
        return prev;
      });
      setMessage({ type: 'success', text: `New bid ¥${data.amount}!` });
      setTimeout(() => setMessage(null), 3000);
    });
    
    socket.on('bid:outbid', (data) => {
      console.log('⚠️ Outbid:', data);
      setMessage({ type: 'error', text: `Your bid on number ${data.number} has been outbid!` });
      setTimeout(() => setMessage(null), 3000);
      fetchNumbers();
    });
    
    return () => {
      socket.disconnect();
    };
  }, [userId, productId, fetchNumbers]);

  useEffect(() => {
    fetchProduct();
    fetchNumbers();
  }, [fetchProduct, fetchNumbers]);

  useEffect(() => {
    if (selectedNumber) fetchBids(selectedNumber.id);
  }, [selectedNumber, fetchBids]);

  const handleSelectNumber = (num: NumberItem) => {
    if (num.status === 'sold') {
      setMessage({ type: 'error', text: 'This number is sold' });
      setTimeout(() => setMessage(null), 3000);
      return;
    }
    setSelectedNumber(num);
    setShowBidPanel(true);
  };

  const getMinBid = (num: NumberItem) => {
    const currentBid = Number(num.current_bid) || Number(product?.base_price) || 0;
    const minIncrement = Number(product?.min_bid_increment) || 1;
    return currentBid + minIncrement;
  };

  const handleBid = async () => {
    if (!token) {
      setMessage({ type: 'error', text: 'Please login first' });
      setTimeout(() => setMessage(null), 3000);
      return;
    }
    if (!selectedNumber) return;
    
    const amount = Number(bidAmount);
    const minBid = getMinBid(selectedNumber);
    
    if (isNaN(amount) || amount <= 0) {
      setMessage({ type: 'error', text: 'Please enter a valid amount' });
      setTimeout(() => setMessage(null), 3000);
      return;
    }
    
    if (amount < minBid) {
      setMessage({ type: 'error', text: `Bid must be at least ¥${minBid}` });
      setTimeout(() => setMessage(null), 3000);
      return;
    }
    
    const res = await fetch(`http://localhost:5000/api/products/${productId}/numbers/${selectedNumber.id}/bids`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ amount })
    });
    const data = await res.json();
    
    if (res.ok && data.success) {
      setMessage({ type: 'success', text: `Bid ¥${amount} successful!` });
      setTimeout(() => setMessage(null), 3000);
      setShowBidPanel(false);
      fetchNumbers();
      fetchProduct();
    } else {
      setMessage({ type: 'error', text: data.error || 'Bid failed' });
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const getNumberColor = (num: NumberItem) => {
    if (num.current_bid_user_id === userId) return 'bg-blue-500';
    if (num.status === 'sold') return 'bg-gray-400';
    if (num.current_bid) return 'bg-orange-500';
    return 'bg-green-500';
  };

  if (loading) return <div className="container mx-auto px-4 py-8 text-center">Loading...</div>;
  if (!product) return <div className="container mx-auto px-4 py-8 text-center">Product not found</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      {message && (
        <div className={`fixed top-20 right-4 z-50 p-4 rounded-lg shadow-lg ${message.type === 'success' ? 'bg-green-500' : 'bg-red-500'} text-white`}>
          {message.text}
        </div>
      )}

      <div className="mb-6">
        <CountdownTimer 
          endTime={product.bid_end_time} 
          onEnd={() => {
            fetchNumbers();
            fetchProduct();
          }}
        />
      </div>

      <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2 sm:mb-4">{product.name}</h1>
          <div className="text-right text-sm">
            {isConnected ? <span className="text-green-500">● WebSocket Connected</span> : <span className="text-gray-400">● WebSocket Connecting...</span>}
          </div>
        </div>
        <p className="text-gray-600 mb-4 text-sm sm:text-base">{product.description || 'No description'}</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          <div><div className="text-gray-500 text-xs sm:text-sm">Current Price</div><div className="text-xl sm:text-2xl font-bold text-red-600">¥{product.current_price}</div></div>
          <div><div className="text-gray-500 text-xs sm:text-sm">Starting Price</div><div className="text-base sm:text-lg">¥{product.base_price}</div></div>
          <div><div className="text-gray-500 text-xs sm:text-sm">Min Increment</div><div className="text-base sm:text-lg">¥{product.min_bid_increment}</div></div>
          <div><div className="text-gray-500 text-xs sm:text-sm">Available Stock</div><div className="text-base sm:text-lg">{product.available_stock}/{product.total_stock}</div></div>
        </div>
      </div>

      {/* Number grid - responsive: 5 columns on mobile, 10 columns on PC */}
      <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-bold mb-4">🎲 Number Selection</h2>
        <div className="grid grid-cols-5 sm:grid-cols-10 gap-1 sm:gap-2">
          {numbers.map((num) => (
            <button
              key={num.id}
              onClick={() => handleSelectNumber(num)}
              disabled={num.status === 'sold'}
              className={`relative p-1 sm:p-3 rounded-lg text-center font-semibold transition-all text-xs sm:text-base ${getNumberColor(num)} ${num.status !== 'sold' ? 'hover:opacity-80 cursor-pointer' : 'cursor-not-allowed opacity-60'}`}
              title={`Number ${num.number}${num.current_bid ? ` - Current bid ¥${num.current_bid}` : ''}`}
            >
              <div className="text-sm sm:text-lg">{num.number}</div>
              {num.current_bid && <div className="text-[10px] sm:text-xs opacity-90">¥{num.current_bid}</div>}
              {num.current_bid_user_id === userId && num.status !== 'sold' && (
                <span className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 text-[10px] sm:text-xs bg-white text-blue-600 rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center font-bold">Me</span>
              )}
              {num.status === 'sold' && <span className="absolute -top-1 -right-1 text-[10px] sm:text-xs">✓</span>}
            </button>
          ))}
        </div>
        {!token && <div className="mt-4 p-3 bg-yellow-100 text-yellow-700 rounded text-sm">⚠️ Please login first to participate in bidding</div>}
      </div>

      {/* Bid Panel */}
      {showBidPanel && selectedNumber && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg sm:text-xl font-bold">Bid - Number {selectedNumber.number}</h2>
              <button onClick={() => setShowBidPanel(false)} className="text-gray-500 hover:text-gray-700 text-2xl">×</button>
            </div>
            <div className="mb-4 p-3 bg-gray-50 rounded">
              <div className="text-gray-600 text-sm">Current Highest Bid</div>
              <div className="text-2xl sm:text-3xl font-bold text-red-600">¥{(selectedNumber.current_bid || product.base_price)}</div>
              <div className="text-gray-500 text-sm mt-1">Minimum Bid: ¥{getMinBid(selectedNumber)}</div>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Bid Amount</label>
              <input
                type="number"
                value={bidAmount}
                onChange={(e) => setBidAmount(e.target.value)}
                placeholder={`Minimum ${getMinBid(selectedNumber)}`}
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                step={product.min_bid_increment}
                min={getMinBid(selectedNumber)}
              />
            </div>
            <button onClick={handleBid} disabled={!token} className="w-full bg-red-600 text-white py-2 rounded hover:bg-red-700">Place Bid</button>
            <div className="mt-4">
              <h3 className="font-semibold mb-2">Bid History</h3>
              <div className="max-h-48 overflow-y-auto space-y-1 border rounded p-2">
                {loadingBids ? <div className="text-center text-gray-500">Loading...</div> : bids.length === 0 ? <div className="text-center text-gray-500">No bids yet</div> : bids.map((bid) => (
                  <div key={bid.id} className="flex justify-between text-sm py-1 border-b">
                    <span className="font-medium">¥{bid.amount}</span>
                    <span className="text-gray-500">{new Date(bid.created_at).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}