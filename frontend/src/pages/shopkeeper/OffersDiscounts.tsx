import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Tag,
  Plus,
  Percent,
  Calendar,
  Package,
  Trash2,
  ToggleLeft,
  ToggleRight,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import { dealerV3Api, CreateDiscountInput, DealerProduct } from '../../services/dealerV3Api';
import { DealerDiscount, DiscountType } from '../../types';

export const OffersDiscounts: React.FC = () => {
  const [discounts, setDiscounts] = useState<DealerDiscount[]>([]);
  const [catalogProducts, setCatalogProducts] = useState<DealerProduct[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // New Discount Form State
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [formData, setFormData] = useState<CreateDiscountInput>({
    product_id: 0,
    title: '',
    discount_type: 'PERCENTAGE',
    discount_value: 10,
    min_quantity: 1,
    max_discount_inr: 500,
    max_discount_cap: 500,
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    description: '',
    is_active: true
  });
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [discList, prodList] = await Promise.all([
        dealerV3Api.getDiscounts().catch(() => []),
        dealerV3Api.getProducts().catch(() => [])
      ]);
      setDiscounts(discList);
      setCatalogProducts(prodList);
      if (prodList.length > 0 && formData.product_id === 0) {
        setFormData((prev) => ({ ...prev, product_id: prodList[0].id }));
      }
    } catch (err) {
      console.error('Failed to load dealer discount data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);


  const handleToggle = async (id: number) => {
    try {
      const updated = await dealerV3Api.toggleDiscount(id);
      setDiscounts((prev) => prev.map((d) => (d.id === id ? updated : d)));
    } catch (err) {
      alert('Failed to toggle discount state');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this promotional discount?')) return;
    try {
      await dealerV3Api.deleteDiscount(id);
      setDiscounts((prev) => prev.filter((d) => d.id !== id));
    } catch (err) {
      alert('Failed to delete discount');
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.product_id || formData.product_id === 0) {
      setErrorMsg('Please select a product from your catalog');
      return;
    }
    if (formData.discount_type === 'PERCENTAGE' && formData.discount_value > 90) {
      setErrorMsg('Percentage discount cannot exceed 90%');
      return;
    }
    if (Number(formData.discount_value) <= 0) {
      setErrorMsg('Discount value must be greater than 0');
      return;
    }
    if (new Date(formData.end_date) <= new Date(formData.start_date)) {
      setErrorMsg('End date must be after start date');
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);

    try {
      const payload: CreateDiscountInput = {
        product_id: Number(formData.product_id),
        title: formData.title.trim(),
        discount_type: formData.discount_type,
        discount_value: Number(formData.discount_value),
        min_quantity: Number(formData.min_quantity) || 1,
        max_discount_cap: formData.max_discount_cap ?? formData.max_discount_inr ?? undefined,
        max_discount_inr: formData.max_discount_inr ?? formData.max_discount_cap ?? undefined,
        start_date: new Date(formData.start_date).toISOString(),
        end_date: new Date(formData.end_date).toISOString(),
        description: formData.description?.trim() || undefined,
        is_active: true
      };

      await dealerV3Api.createDiscount(payload);
      
      // Close modal
      setShowCreateModal(false);

      // Show success toast
      setSuccessToast('Promotional offer activated successfully.');
      setTimeout(() => setSuccessToast(null), 5000);

      // Refresh active discounts list immediately
      await fetchData();

      // Reset form
      setFormData({
        product_id: catalogProducts[0]?.id || 0,
        title: '',
        discount_type: 'PERCENTAGE',
        discount_value: 10,
        min_quantity: 1,
        max_discount_inr: 500,
        max_discount_cap: 500,
        start_date: new Date().toISOString().split('T')[0],
        end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        description: '',
        is_active: true
      });
    } catch (err: any) {
      setErrorMsg(err.response?.data?.detail || 'Failed to create discount');
    } finally {
      setSubmitting(false);
    }
  };

  const openCreateModal = () => {
    setErrorMsg(null);
    if (catalogProducts.length > 0 && (!formData.product_id || formData.product_id === 0)) {
      setFormData((prev) => ({ ...prev, product_id: catalogProducts[0].id }));
    }
    setShowCreateModal(true);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-gradient-to-r from-emerald-800 to-emerald-950 text-white p-6 rounded-2xl shadow-lg">
        <div className="space-y-1">
          <span className="px-2.5 py-0.5 rounded-full bg-emerald-700/80 text-[11px] font-bold tracking-wide uppercase">
            Dealer Growth Suite
          </span>
          <h1 className="text-2xl sm:text-3xl font-black">Promotional Offers & Discounts</h1>
          <p className="text-xs sm:text-sm text-emerald-100/90 max-w-2xl">
            Create seasonal discounts for seeds, fertilizers, and equipment. Products on sale display verified badges on the farmer marketplace with transparent pricing rules.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-5 py-3 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl text-xs font-bold transition shadow-md shadow-emerald-950/30"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Offer</span>
        </button>
      </div>

      {/* Success Toast */}
      {successToast && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center justify-between gap-2 shadow-sm animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successToast}</span>
          </div>
          <button
            onClick={() => setSuccessToast(null)}
            className="text-emerald-700 hover:text-emerald-900 font-black px-1.5 py-0.5 rounded"
          >
            ✕
          </button>
        </div>
      )}

      {/* Discounts List */}
      {loading ? (
        <div className="text-center py-16 space-y-3">
          <RefreshCw className="w-8 h-8 mx-auto text-emerald-600 animate-spin" />
          <p className="text-sm font-semibold text-slate-600">Loading store promotions...</p>
        </div>
      ) : discounts.length === 0 ? (
        <div className="text-center py-16 bg-white border border-slate-200 rounded-2xl p-8 space-y-4">
          <Tag className="w-12 h-12 mx-auto text-slate-300" />
          <h3 className="text-base font-bold text-slate-700">No promotional offers active</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Create seasonal offers for high-demand agricultural inputs to attract local farmers during sowing season.
          </p>
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            <span>Create Promotional Discount</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {discounts.map((disc) => (
            <div
              key={disc.id}
              className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    {disc.discount_type === 'PERCENTAGE'
                      ? `${disc.discount_value}% OFF`
                      : `₹${disc.discount_value} OFF`}
                  </span>

                  <button
                    onClick={() => handleToggle(disc.id)}
                    className="flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-800 transition"
                  >
                    {disc.is_active ? (
                      <span className="flex items-center gap-1 text-emerald-600 font-bold">
                        <ToggleRight className="w-5 h-5" /> Active
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-slate-400">
                        <ToggleLeft className="w-5 h-5" /> Paused
                      </span>
                    )}
                  </button>
                </div>

                <div>
                  <h3 className="font-bold text-base text-slate-800 line-clamp-1">{disc.title}</h3>
                  <span className="text-xs text-slate-500 font-medium block mt-0.5">
                    Product: {disc.product_name || `Product #${disc.product_id}`}
                  </span>
                </div>

                {/* Price Display */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Original Price</span>
                    <span className="text-xs line-through text-slate-400">
                      ₹{disc.original_price?.toLocaleString('en-IN') || 0}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-emerald-600 block">Discounted Price</span>
                    <span className="text-lg font-black text-emerald-700">
                      ₹{disc.discounted_price?.toLocaleString('en-IN') || 0}
                    </span>
                  </div>
                </div>

                {disc.description && (
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {disc.description}
                  </p>
                )}

                <div className="text-[11px] text-slate-500 space-y-1 pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <span>Min Quantity:</span>
                    <span className="font-semibold text-slate-700">{disc.min_quantity} Units</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Valid Until:</span>
                    <span className="font-semibold text-slate-700">
                      {new Date(disc.end_date).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end pt-3 border-t border-slate-100">
                <button
                  onClick={() => handleDelete(disc.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition"
                  title="Delete offer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <h3 className="font-bold text-lg text-slate-800">
              Create Promotional Offer
            </h3>
            <p className="text-xs text-slate-500">
              Configure discounted prices for products in your store catalog.
            </p>

            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleCreate} className="space-y-4 pt-1">
              {/* Product Selection */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">Select Catalog Product</label>
                {catalogProducts.length === 0 ? (
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-2.5">
                    <div className="flex items-center gap-2 text-xs font-semibold text-amber-900">
                      <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>No products found in your catalog. Add a product first.</span>
                    </div>
                    <div>
                      <Link
                        to="/shopkeeper/products"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition shadow-sm"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Go to Product Catalog</span>
                        <ExternalLink className="w-3 h-3 ml-0.5" />
                      </Link>
                    </div>
                  </div>
                ) : (
                  <>
                    <select
                      required
                      value={formData.product_id || ''}
                      onChange={(e) => {
                        const selId = Number(e.target.value);
                        const selProd = catalogProducts.find((p) => p.id === selId);
                        setFormData((prev) => ({
                          ...prev,
                          product_id: selId,
                          title: prev.title || (selProd ? `Special Offer: ${selProd.name}` : '')
                        }));
                      }}
                      className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 font-semibold text-slate-800"
                    >
                      <option value="">Select a catalog product</option>
                      {catalogProducts.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} - ₹{p.price}
                        </option>
                      ))}
                    </select>

                    {formData.product_id > 0 && (() => {
                      const selected = catalogProducts.find((p) => p.id === formData.product_id);
                      if (!selected) return null;
                      const orig = selected.price;
                      const discVal = Number(formData.discount_value) || 0;
                      let calculated = orig;
                      if (formData.discount_type === 'PERCENTAGE') {
                        calculated = Math.max(0, orig * (1 - (discVal / 100)));
                      } else {
                        calculated = Math.max(0, orig - discVal);
                      }
                      return (
                        <div className="p-2.5 bg-emerald-50/70 border border-emerald-100 rounded-xl flex flex-wrap items-center justify-between text-xs gap-2">
                          <span className="text-slate-600 font-medium">Original: <strong className="text-slate-800">₹{orig}</strong></span>
                          <span className="text-emerald-700 font-bold">Offer Price: <strong>₹{calculated.toFixed(2)}</strong></span>
                          <span className="text-slate-500 text-[11px]">Stock: {selected.stock_quantity} {selected.unit}</span>
                        </div>
                      );
                    })()}
                  </>
                )}
              </div>

              {/* Offer Title */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">Offer Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sowing Special - 15% OFF Basmati Seeds"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Discount Type & Value */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">Discount Type</label>
                  <select
                    value={formData.discount_type}
                    onChange={(e) => setFormData({ ...formData, discount_type: e.target.value as DiscountType })}
                    className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 font-semibold"
                  >
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FLAT_AMOUNT">Flat Amount (₹)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">
                    Discount Value {formData.discount_type === 'PERCENTAGE' ? '(%)' : '(₹)'}
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={formData.discount_type === 'PERCENTAGE' ? 90 : 100000}
                    required
                    value={formData.discount_value}
                    onChange={(e) => setFormData({ ...formData, discount_value: Number(e.target.value) })}
                    className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 font-bold"
                  />
                </div>
              </div>

              {/* Min Quantity & Max Cap */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">Min Quantity</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.min_quantity}
                    onChange={(e) => setFormData({ ...formData, min_quantity: Number(e.target.value) })}
                    className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 font-semibold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">Max Discount Cap (₹)</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.max_discount_cap ?? formData.max_discount_inr ?? ''}
                    onChange={(e) => {
                      const val = e.target.value ? Number(e.target.value) : undefined;
                      setFormData({ ...formData, max_discount_inr: val, max_discount_cap: val });
                    }}
                    placeholder="Optional max limit"
                    className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 font-semibold"
                  />
                </div>
              </div>

              {/* Start and End Date */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">Start Date</label>
                  <input
                    type="date"
                    required
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">End Date</label>
                  <input
                    type="date"
                    required
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">Description / Terms</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Valid on bulk purchase of certified hybrid seeds. Free local delivery on orders above ₹5,000."
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-700 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || catalogProducts.length === 0}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl shadow-sm transition"
                >
                  {submitting ? 'Activating Offer...' : 'Activate Discount'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default OffersDiscounts;
