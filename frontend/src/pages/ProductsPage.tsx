import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { productApi } from '../api/productApi';
import { offlineDb } from '../utils/offlineDb';
import { Product, ProductCreateRequest } from '../types/product';
import { BatchImportModal } from '../components/BatchImportModal';
import {
  Package,
  Plus,
  FileSpreadsheet,
  Search,
  Tag,
  Boxes,
  Loader2,
  DollarSign
} from 'lucide-react';

export const ProductsPage: React.FC = () => {
  const { activeTenantId } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState<ProductCreateRequest>({
    sku: '',
    name: '',
    description: '',
    price: 99.99,
    stockQuantity: 100,
    category: 'Hardware',
  });
  const [saving, setSaving] = useState(false);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await productApi.list(0, 100);
      const list = res.content || [];
      setProducts(list);
      // Cache products in IndexedDB for offline POS
      await offlineDb.cacheProducts(list);
    } catch (e) {
      console.warn('Network fetch failed, loading cached products from IndexedDB', e);
      const cached = await offlineDb.getCachedProducts();
      setProducts(cached);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [activeTenantId]);

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await productApi.create(formData);
      setIsAddModalOpen(false);
      setFormData({
        sku: '',
        name: '',
        description: '',
        price: 99.99,
        stockQuantity: 100,
        category: 'Hardware',
      });
      fetchProducts();
    } catch (err: any) {
      alert(err.response?.data?.message || err.message || 'Failed to create product');
    } finally {
      setSaving(false);
    }
  };

  const sampleBatchProducts = JSON.stringify(
    [
      {
        sku: "PROD-KB-RGB",
        name: "Mechanical Keyboard RGB",
        description: "Mechanical keyboard with hot-swappable switches",
        price: 129.99,
        stockQuantity: 150,
        category: "Peripherals"
      },
      {
        sku: "PROD-HEADSET-PRO",
        name: "Wireless ANC Headset Pro",
        description: "Noise cancelling studio quality headset",
        price: 249.50,
        stockQuantity: 80,
        category: "Audio"
      },
      {
        sku: "PROD-MONITOR-4K",
        name: "Ultra-Wide 34-inch 4K Monitor",
        description: "Curved 144Hz HDR IPS panel",
        price: 649.00,
        stockQuantity: 35,
        category: "Displays"
      }
    ],
    null,
    2
  );

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase()) ||
      (p.category && p.category.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Package className="w-5 h-5 text-purple-400" />
            <span>Product Catalog & Stock Management</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            CQRS-driven catalog with transactional stock reservation and offline cached lookups.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsBatchModalOpen(true)}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3.5 py-2 rounded-xl text-xs font-semibold transition"
          >
            <FileSpreadsheet className="w-4 h-4 text-indigo-400" />
            <span>Batch Import</span>
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-xl text-xs font-bold transition shadow-lg shadow-purple-900/30"
          >
            <Plus className="w-4 h-4" />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {/* Search Filter */}
      <div className="flex items-center gap-3 bg-slate-900/80 border border-slate-800 rounded-2xl p-2 px-3.5">
        <Search className="w-4 h-4 text-slate-500" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products by SKU, name, or category..."
          className="bg-transparent text-xs text-white placeholder-slate-500 w-full outline-none"
        />
      </div>

      {/* Product Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-800/50 border-b border-slate-800 text-slate-400 uppercase font-semibold">
              <tr>
                <th className="px-5 py-3">Product Name / Description</th>
                <th className="px-4 py-3">SKU</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Unit Price</th>
                <th className="px-4 py-3">Stock Available</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-500">
                    <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-purple-400" />
                    Loading product catalog...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-500">
                    No products found in catalog.
                  </td>
                </tr>
              ) : (
                filtered.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-800/40 transition">
                    <td className="px-5 py-3.5">
                      <div className="font-bold text-white">{p.name}</div>
                      <div className="text-[11px] text-slate-400 truncate max-w-xs">{p.description || 'No description'}</div>
                    </td>
                    <td className="px-4 py-3.5 font-mono text-purple-300 font-semibold">{p.sku}</td>
                    <td className="px-4 py-3.5">
                      <span className="bg-slate-800 border border-slate-700 px-2 py-0.5 rounded text-[11px] text-slate-300">
                        {p.category || 'General'}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 font-bold text-white font-mono">
                      ${Number(p.price).toFixed(2)}
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`font-mono font-bold ${
                          p.stockQuantity > 20
                            ? 'text-emerald-400'
                            : p.stockQuantity > 0
                            ? 'text-amber-400'
                            : 'text-rose-400'
                        }`}
                      >
                        {p.stockQuantity} units
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                          p.status === 'ACTIVE'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/60'
                            : 'bg-slate-800 text-slate-400 border border-slate-700'
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Product Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-2xl p-6 shadow-2xl space-y-4">
            <h3 className="font-bold text-base text-white flex items-center gap-2">
              <Plus className="w-5 h-5 text-purple-400" />
              <span>Add Catalog Item</span>
            </h3>

            <form onSubmit={handleCreateProduct} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Product SKU *</label>
                <input
                  type="text"
                  required
                  value={formData.sku}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                  placeholder="PROD-SAMPLE-01"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white outline-none focus:border-purple-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Product Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enterprise Wireless Access Point"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={2}
                  placeholder="High density multi-band WiFi 6 gateway"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Unit Price ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-mono outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Initial Stock *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.stockQuantity}
                    onChange={(e) => setFormData({ ...formData, stockQuantity: parseInt(e.target.value) || 0 })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-mono outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Category</label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="Hardware"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white outline-none focus:border-purple-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-slate-400 hover:text-white rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-bold px-5 py-2 rounded-xl transition"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  <span>Save Product</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Batch Import Modal */}
      <BatchImportModal<ProductCreateRequest, Product>
        title="Batch Import Products (Standard Chassis)"
        isOpen={isBatchModalOpen}
        onClose={() => {
          setIsBatchModalOpen(false);
          fetchProducts();
        }}
        sampleTemplate={sampleBatchProducts}
        parseInput={(text) => JSON.parse(text)}
        onImport={(items) => productApi.batchCreate({ items, continueOnError: true })}
        renderItemSummary={(p) => `${p.name} ($${p.price})`}
      />
    </div>
  );
};

