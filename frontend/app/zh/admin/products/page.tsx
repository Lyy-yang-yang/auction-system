'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Product {
  id: string;
  name: string;
  description: string;
  image_url: string;
  base_price: number;
  current_price: number;
  total_stock: number;
  available_stock: number;
  min_bid_increment: number;
  bid_end_time: string;
  status: string;
}

export default function AdminProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (!storedToken) {
      router.push('/zh');
      return;
    }
    setToken(storedToken);
  }, [router]);

  const fetchProducts = async () => {
    if (!token) return;
    try {
      const res = await fetch('http://localhost:5000/api/products', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
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
    if (token) {
      fetchProducts();
    }
  }, [token]);

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这个产品吗？')) return;
    try {
      const res = await fetch(`http://localhost:5000/api/products/admin/products/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        fetchProducts();
      } else {
        alert('删除失败');
      }
    } catch (error) {
      console.error('删除失败:', error);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setShowModal(true);
  };

  const handleCreate = () => {
    setEditingProduct(null);
    setShowModal(true);
  };

  const handleSave = () => {
    fetchProducts();
    setShowModal(false);
  };

  if (loading) {
    return <div className="text-center py-8">加载中...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">产品管理</h1>
        <button
          onClick={handleCreate}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          + 新增产品
        </button>
      </div>

      {/* 响应式表格容器 */}
      <div className="table-container overflow-x-auto">
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-[600px] md:min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">名称</th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">当前价格</th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">库存</th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">状态</th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {products.map((product) => (
                <tr key={product.id}>
                  <td className="px-4 sm:px-6 py-4 text-sm">{product.name}</td>
                  <td className="px-4 sm:px-6 py-4 text-sm">¥{product.current_price}</td>
                  <td className="px-4 sm:px-6 py-4 text-sm">{product.available_stock}/{product.total_stock}</td>
                  <td className="px-4 sm:px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs ${
                      product.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {product.status === 'active' ? '进行中' : '已结束'}
                    </span>
                  </td>
                  <td className="px-4 sm:px-6 py-4 space-x-2">
                    <button
                      onClick={() => handleEdit(product)}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      编辑
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      删除
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <ProductFormModal
          product={editingProduct}
          token={token}
          onClose={() => setShowModal(false)}
          onSaved={handleSave}
        />
      )}
    </div>
  );
}

// ProductFormModal 组件
function ProductFormModal({ product, token, onClose, onSaved }: any) {
  // 将 UTC 时间转换为本地 datetime-local 格式
  const formatDateTimeLocal = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const [formData, setFormData] = useState({
    name: product?.name || '',
    description: product?.description || '',
    image_url: product?.image_url || '',
    base_price: product?.base_price || 100,
    min_bid_increment: product?.min_bid_increment || 1,
    bid_end_time: product?.bid_end_time ? formatDateTimeLocal(product.bid_end_time) : '',
    total_stock: product?.total_stock || 100,
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const url = product
      ? `http://localhost:5000/api/products/admin/products/${product.id}`
      : 'http://localhost:5000/api/products/admin/products';
    
    const method = product ? 'PUT' : 'POST';

    let bidEndTimeUTC = null;
    if (formData.bid_end_time) {
      const localDate = new Date(formData.bid_end_time);
      bidEndTimeUTC = localDate.toISOString();
    }

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          image_url: formData.image_url,
          base_price: Number(formData.base_price),
          min_bid_increment: Number(formData.min_bid_increment),
          bid_end_time: bidEndTimeUTC,
          total_stock: Number(formData.total_stock),
        })
      });
      
      if (res.ok) {
        onSaved();
      } else {
        const data = await res.json();
        alert(data.error || '保存失败');
      }
    } catch (error) {
      alert('网络错误');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-md">
        <h2 className="text-lg sm:text-xl font-bold mb-4">{product ? '编辑产品' : '新增产品'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">名称</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full p-2 border rounded text-sm sm:text-base"
              required
            />
          </div>
          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">描述</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full p-2 border rounded text-sm sm:text-base"
              rows={3}
            />
          </div>
          {/* 图片 URL - 新增字段 */}
          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">图片 URL</label>
            <input
              type="text"
              value={formData.image_url}
              onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
              placeholder="https://picsum.photos/200/150?random=1"
              className="w-full p-2 border rounded text-sm sm:text-base"
            />
            {formData.image_url && (
              <div className="mt-2">
                <img src={formData.image_url} alt="预览" className="h-20 w-auto border rounded" />
              </div>
            )}
          </div>
          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">起拍价</label>
            <input
              type="number"
              value={formData.base_price}
              onChange={(e) => setFormData({ ...formData, base_price: Number(e.target.value) })}
              className="w-full p-2 border rounded text-sm sm:text-base"
              required
            />
          </div>
          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">加价幅度</label>
            <input
              type="number"
              value={formData.min_bid_increment}
              onChange={(e) => setFormData({ ...formData, min_bid_increment: Number(e.target.value) })}
              className="w-full p-2 border rounded text-sm sm:text-base"
              step="0.5"
            />
          </div>
          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">结束时间（北京时间）</label>
            <input
              type="datetime-local"
              value={formData.bid_end_time}
              onChange={(e) => setFormData({ ...formData, bid_end_time: e.target.value })}
              className="w-full p-2 border rounded text-sm sm:text-base"
              required
            />
          </div>
          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">总库存</label>
            <input
              type="number"
              value={formData.total_stock}
              onChange={(e) => setFormData({ ...formData, total_stock: Number(e.target.value) })}
              className="w-full p-2 border rounded text-sm sm:text-base"
            />
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-3 sm:px-4 py-2 border rounded hover:bg-gray-50 text-sm"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-3 sm:px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 text-sm"
            >
              {loading ? '保存中...' : '保存'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}