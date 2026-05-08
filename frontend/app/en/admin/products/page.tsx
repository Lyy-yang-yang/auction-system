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
      router.push('/en');
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
      console.error('Failed to fetch products:', error);
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
    if (!confirm('Are you sure you want to delete this product?')) return;
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
        alert('Delete failed');
      }
    } catch (error) {
      console.error('Delete failed:', error);
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
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Product Management</h1>
        <button
          onClick={handleCreate}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          + Add Product
        </button>
      </div>

      {/* Responsive table container */}
      <div className="table-container overflow-x-auto">
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-[600px] md:min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Current Price</th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
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
                      {product.status === 'active' ? 'Active' : 'Ended'}
                    </span>
                  </td>
                  <td className="px-4 sm:px-6 py-4 space-x-2">
                    <button
                      onClick={() => handleEdit(product)}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Delete
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

// ProductFormModal Component
function ProductFormModal({ product, token, onClose, onSaved }: any) {
  // Convert UTC time to local datetime-local format
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
        alert(data.error || 'Save failed');
      }
    } catch (error) {
      alert('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-md">
        <h2 className="text-lg sm:text-xl font-bold mb-4">{product ? 'Edit Product' : 'Add Product'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full p-2 border rounded text-sm sm:text-base"
              required
            />
          </div>
          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full p-2 border rounded text-sm sm:text-base"
              rows={3}
            />
          </div>
          {/* Image URL Field */}
          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">Image URL</label>
            <input
              type="text"
              value={formData.image_url}
              onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
              placeholder="https://picsum.photos/200/150?random=1"
              className="w-full p-2 border rounded text-sm sm:text-base"
            />
            {formData.image_url && (
              <div className="mt-2">
                <img src={formData.image_url} alt="Preview" className="h-20 w-auto border rounded" />
              </div>
            )}
          </div>
          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">Starting Price</label>
            <input
              type="number"
              value={formData.base_price}
              onChange={(e) => setFormData({ ...formData, base_price: Number(e.target.value) })}
              className="w-full p-2 border rounded text-sm sm:text-base"
              required
            />
          </div>
          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">Min Increment</label>
            <input
              type="number"
              value={formData.min_bid_increment}
              onChange={(e) => setFormData({ ...formData, min_bid_increment: Number(e.target.value) })}
              className="w-full p-2 border rounded text-sm sm:text-base"
              step="0.5"
            />
          </div>
          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">End Time (Beijing Time)</label>
            <input
              type="datetime-local"
              value={formData.bid_end_time}
              onChange={(e) => setFormData({ ...formData, bid_end_time: e.target.value })}
              className="w-full p-2 border rounded text-sm sm:text-base"
              required
            />
          </div>
          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">Total Stock</label>
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
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-3 sm:px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 text-sm"
            >
              {loading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}