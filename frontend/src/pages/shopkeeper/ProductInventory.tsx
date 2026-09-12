import React, { useState, useEffect } from 'react';
import { PackageCheck, Plus, Search, Tag, CheckCircle2, AlertCircle, RefreshCw, X } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { dealerV3Api, DealerProduct, CreateDealerProductInput } from '../../services/dealerV3Api';
import { formatINR } from '../../utils/formatters';

export const ProductInventory: React.FC = () => {
  const [products, setProducts] = useState<DealerProduct[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  // Add Product Modal
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [newProduct, setNewProduct] = useState<CreateDealerProductInput>({
    name: '',
    category: 'Fertilizer',
    brand: '',
    price: 0,
    unit: '50kg Bag',
    stock_quantity: 100,
    low_stock_threshold: 10,
    is_organic: false,
    description: ''
  });
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const data = await dealerV3Api.getProducts();
      setProducts(data);
    } catch (err) {
      console.error('Failed to load dealer catalog:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProduct.name.trim()) {
      setModalError('Please provide a product name');
      return;
    }
    if (newProduct.price <= 0) {
      setModalError('Price must be greater than ₹0');
      return;
    }

    setSubmitting(true);
    setModalError(null);

    try {
      await dealerV3Api.createProduct({
        ...newProduct,
        name: newProduct.name.trim(),
        brand: newProduct.brand?.trim() || undefined,
        description: newProduct.description?.trim() || undefined
      });

      setShowAddModal(false);
      setSuccessToast(`Product "${newProduct.name.trim()}" added to your catalog successfully.`);
      setTimeout(() => setSuccessToast(null), 5000);

      // Reset
      setNewProduct({
        name: '',
        category: 'Fertilizer',
        brand: '',
        price: 0,
        unit: '50kg Bag',
        stock_quantity: 100,
        low_stock_threshold: 10,
        is_organic: false,
        description: ''
      });

      await fetchProducts();
    } catch (err: any) {
      setModalError(err.response?.data?.detail || 'Failed to create product');
    } finally {
      setSubmitting(false);
    }
  };

  const categories = ['ALL', ...Array.from(new Set(products.map((p) => p.category)))];

  const filtered = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.brand && p.brand.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCat = selectedCategory === 'ALL' || p.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Agricultural Store Product Catalog
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Maintain stock levels, retail pricing, and supplier brands for local farmer lookup.
          </p>
        </div>

        <button
          onClick={() => {
            setModalError(null);
            setShowAddModal(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
        </button>
      </div>

      {successToast && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center justify-between gap-2 shadow-sm animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successToast}</span>
          </div>
          <button onClick={() => setSuccessToast(null)} className="text-emerald-700 hover:text-emerald-900 font-black">
            ✕
          </button>
        </div>
      )}

      {/* Filters & Search */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search by product name or brand..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-600">Category:</span>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="p-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 font-semibold"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      <Card className="p-6">
        {loading ? (
          <div className="text-center py-12 space-y-3">
            <RefreshCw className="w-7 h-7 mx-auto text-emerald-600 animate-spin" />
            <p className="text-xs font-semibold text-slate-600">Loading your store catalog...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12 space-y-3">
            <PackageCheck className="w-10 h-10 mx-auto text-slate-300" />
            <h3 className="text-sm font-bold text-slate-800">Your Product Catalog is Empty</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Add your seeds, fertilizers, pesticides, and tools to make them visible to local farmers and create promotional discount offers.
            </p>
            <button
              onClick={() => {
                setModalError(null);
                setShowAddModal(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Add Your First Product</span>
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 space-y-2">
            <p className="text-xs font-semibold text-slate-500">No products match your search or filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100 uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-4">Item Name</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Brand</th>
                  <th className="py-3 px-4">Price</th>
                  <th className="py-3 px-4">Pack Unit</th>
                  <th className="py-3 px-4">Stock on Hand</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filtered.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {p.name}
                      {p.is_organic && (
                        <span className="ml-2 px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                          Organic
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">{p.category}</td>
                    <td className="py-3.5 px-4 font-semibold text-slate-600">{p.brand || '—'}</td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{formatINR(p.price)}</td>
                    <td className="py-3.5 px-4">{p.unit}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-800">{p.stock_quantity} Units</td>
                    <td className="py-3.5 px-4">
                      <Badge variant={p.stock_quantity > 0 ? 'green' : 'red'} size="sm">
                        {p.stock_quantity > 0 ? 'IN STOCK' : 'OUT OF STOCK'}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-slate-800">Add Product to Store Catalog</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {modalError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleCreateProduct} className="space-y-3.5">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">Product Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Zinc Sulphate 21% Monohydrate"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">Category</label>
                  <select
                    value={newProduct.category}
                    onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                    className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 font-semibold"
                  >
                    <option value="Fertilizer">Fertilizer</option>
                    <option value="Seeds">Seeds</option>
                    <option value="Bio-fertilizer">Bio-fertilizer</option>
                    <option value="Pesticide">Pesticide</option>
                    <option value="Herbicide">Herbicide</option>
                    <option value="Irrigation">Irrigation</option>
                    <option value="Tools">Tools</option>
                    <option value="Bio-Organic">Bio-Organic</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">Brand / Manufacturer</label>
                  <input
                    type="text"
                    placeholder="e.g. IFFCO, Bayer, Syngenta"
                    value={newProduct.brand || ''}
                    onChange={(e) => setNewProduct({ ...newProduct, brand: e.target.value })}
                    className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">Retail Price (₹)</label>
                  <input
                    type="number"
                    min="1"
                    step="0.5"
                    required
                    value={newProduct.price || ''}
                    onChange={(e) => setNewProduct({ ...newProduct, price: Number(e.target.value) })}
                    className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">Pack Unit</label>
                  <input
                    type="text"
                    placeholder="e.g. 50kg Bag, 1 Litre, 10g Pack"
                    value={newProduct.unit}
                    onChange={(e) => setNewProduct({ ...newProduct, unit: e.target.value })}
                    className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">Stock on Hand</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={newProduct.stock_quantity}
                    onChange={(e) => setNewProduct({ ...newProduct, stock_quantity: Number(e.target.value) })}
                    className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 font-semibold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">Low Stock Alert Threshold</label>
                  <input
                    type="number"
                    min="1"
                    value={newProduct.low_stock_threshold || 10}
                    onChange={(e) => setNewProduct({ ...newProduct, low_stock_threshold: Number(e.target.value) })}
                    className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 font-semibold"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="is_organic"
                  checked={newProduct.is_organic}
                  onChange={(e) => setNewProduct({ ...newProduct, is_organic: e.target.checked })}
                  className="rounded text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                />
                <label htmlFor="is_organic" className="text-xs text-slate-700 font-medium">
                  Certified Organic / Bio-friendly product
                </label>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">Description (Optional)</label>
                <textarea
                  rows={2}
                  placeholder="Application rates, crop suitability, or instructions"
                  value={newProduct.description || ''}
                  onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                  className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-700 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm transition"
                >
                  {submitting ? 'Saving...' : 'Add to Catalog'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductInventory;

