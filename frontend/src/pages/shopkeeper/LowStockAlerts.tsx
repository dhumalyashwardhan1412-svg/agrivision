import React, { useEffect, useState } from 'react';
import {
  AlertTriangle,
  Package,
  CheckCircle,
  Plus,
  RefreshCw,
  Settings,
  ArrowUpRight,
  TrendingDown,
  ShieldCheck,
  Search
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { dealerV3Api } from '../../services/dealerV3Api';
import { LowStockProduct } from '../../types';

export const LowStockAlerts: React.FC = () => {
  const [products, setProducts] = useState<LowStockProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals for threshold update & restock
  const [selectedProduct, setSelectedProduct] = useState<LowStockProduct | null>(null);
  const [thresholdModalOpen, setThresholdModalOpen] = useState(false);
  const [newThreshold, setNewThreshold] = useState<number>(10);

  const [restockModalOpen, setRestockModalOpen] = useState(false);
  const [restockAddAmount, setRestockAddAmount] = useState<number>(20);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await dealerV3Api.getLowStockProducts();
      setProducts(res);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to fetch inventory stock statuses.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleOpenThreshold = (p: LowStockProduct) => {
    setSelectedProduct(p);
    setNewThreshold(p.low_stock_threshold);
    setThresholdModalOpen(true);
  };

  const handleSaveThreshold = async () => {
    if (!selectedProduct) return;
    if (newThreshold < 0) {
      alert('Threshold cannot be negative.');
      return;
    }
    try {
      setActionLoading(true);
      await dealerV3Api.updateStockThreshold(selectedProduct.product_id, newThreshold);
      setThresholdModalOpen(false);
      await fetchProducts();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to update threshold.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenRestock = (p: LowStockProduct) => {
    setSelectedProduct(p);
    setRestockAddAmount(p.suggested_restock > 0 ? p.suggested_restock : 20);
    setRestockModalOpen(true);
  };

  const handleConfirmRestock = async () => {
    if (!selectedProduct) return;
    if (restockAddAmount <= 0) {
      alert('Please enter a positive restock quantity.');
      return;
    }
    const newTotal = selectedProduct.current_stock + restockAddAmount;
    try {
      setActionLoading(true);
      await dealerV3Api.updateStockQuantity(selectedProduct.product_id, newTotal);
      setRestockModalOpen(false);
      await fetchProducts();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to restock product.');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status: 'HEALTHY' | 'LOW' | 'CRITICAL' | 'OUT_OF_STOCK') => {
    switch (status) {
      case 'OUT_OF_STOCK':
        return <Badge variant="red" size="sm">Out of Stock (0)</Badge>;
      case 'CRITICAL':
        return <Badge variant="red" size="sm">Critical &lt; 50%</Badge>;
      case 'LOW':
        return <Badge variant="amber" size="sm">Low Stock</Badge>;
      case 'HEALTHY':
        return <Badge variant="green" size="sm">Healthy Stock</Badge>;
      default:
        return <Badge variant="slate" size="sm">{status}</Badge>;
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchesFilter = statusFilter === 'ALL' || p.status === statusFilter;
    const matchesSearch =
      p.product_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const criticalCount = products.filter(p => p.status === 'CRITICAL' || p.status === 'OUT_OF_STOCK').length;
  const lowCount = products.filter(p => p.status === 'LOW').length;
  const healthyCount = products.filter(p => p.status === 'HEALTHY').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Low Stock & Replenishment Alerts
            </h1>
            <Badge variant="blue" size="sm">V3 Inventory Monitor</Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time threshold surveillance preventing supply disruptions during peak planting seasons.
          </p>
        </div>

        <Button
          onClick={fetchProducts}
          disabled={loading}
          variant="outline"
          className="self-start sm:self-auto gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Stock</span>
        </Button>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-xs font-semibold">
          {error}
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 border-l-4 border-l-rose-500">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Critical / Out of Stock</span>
            <AlertTriangle className="w-5 h-5 text-rose-600" />
          </div>
          <div className="text-3xl font-black text-rose-600 mt-2">{criticalCount}</div>
          <p className="text-[11px] text-slate-400 mt-1">Immediate reorder required</p>
        </Card>

        <Card className="p-4 border-l-4 border-l-amber-500">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Low Stock Warnings</span>
            <TrendingDown className="w-5 h-5 text-amber-600" />
          </div>
          <div className="text-3xl font-black text-amber-600 mt-2">{lowCount}</div>
          <p className="text-[11px] text-slate-400 mt-1">Below configured trigger thresholds</p>
        </Card>

        <Card className="p-4 border-l-4 border-l-emerald-500">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Sufficiently Stocked</span>
            <CheckCircle className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="text-3xl font-black text-emerald-700 mt-2">{healthyCount}</div>
          <p className="text-[11px] text-slate-400 mt-1">Buffer above safety margins</p>
        </Card>
      </div>

      {/* Filters & Search Bar */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search product or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto">
            {['ALL', 'CRITICAL', 'OUT_OF_STOCK', 'LOW', 'HEALTHY'].map((filter) => (
              <button
                key={filter}
                onClick={() => setStatusFilter(filter)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                  statusFilter === filter
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {filter.replace(/_/g, ' ')}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Products Table */}
      <Card className="p-6">
        <CardHeader className="px-0 pt-0 mb-4">
          <CardTitle className="text-base font-bold text-slate-900">
            Stock Monitor Table
          </CardTitle>
          <CardDescription className="text-xs text-slate-500">
            Click Quick Restock to instantly replenish inventory or customize alert thresholds per SKU.
          </CardDescription>
        </CardHeader>

        {loading ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-slate-400" />
            Checking stock threshold margins...
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            No products match the selected criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100 uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-4">Product Name</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Current Stock</th>
                  <th className="py-3 px-4">Alert Threshold</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Suggested Restock</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filteredProducts.map((prod) => (
                  <tr key={prod.product_id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {prod.product_name}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[11px] font-semibold">
                        {prod.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold">
                      <span className={prod.current_stock <= prod.low_stock_threshold ? 'text-rose-600' : 'text-slate-900'}>
                        {prod.current_stock} {prod.unit}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-500">
                      {prod.low_stock_threshold} {prod.unit}
                    </td>
                    <td className="py-3.5 px-4">
                      {getStatusBadge(prod.status)}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-sky-700">
                      {prod.suggested_restock > 0 ? `+${prod.suggested_restock} ${prod.unit}` : '—'}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleOpenThreshold(prod)}
                          className="h-7 px-2 text-[11px] gap-1"
                        >
                          <Settings className="w-3 h-3" />
                          <span className="hidden sm:inline">Threshold</span>
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleOpenRestock(prod)}
                          className="h-7 px-2.5 text-[11px] bg-sky-700 hover:bg-sky-800 text-white gap-1"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Restock</span>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Threshold Modal */}
      <Modal
        isOpen={thresholdModalOpen}
        onClose={() => setThresholdModalOpen(false)}
        title="Adjust Low Stock Alert Threshold"
      >
        <div className="space-y-4 pt-2">
          <p className="text-xs text-slate-500">
            Set the minimum inventory quantity for <span className="font-bold text-slate-800">{selectedProduct?.product_name}</span> before AgriVision triggers a proactive warning.
          </p>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Threshold Quantity ({selectedProduct?.unit || 'units'})
            </label>
            <input
              type="number"
              min={0}
              value={newThreshold}
              onChange={(e) => setNewThreshold(Number(e.target.value))}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 font-mono"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setThresholdModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveThreshold}
              disabled={actionLoading}
              className="bg-sky-700 hover:bg-sky-800 text-white"
            >
              {actionLoading ? 'Saving...' : 'Update Threshold'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Quick Restock Modal */}
      <Modal
        isOpen={restockModalOpen}
        onClose={() => setRestockModalOpen(false)}
        title="Quick Restock Inventory"
      >
        <div className="space-y-4 pt-2">
          <div className="p-3 bg-sky-50 border border-sky-200 rounded-xl text-xs text-sky-900">
            <span className="font-bold">{selectedProduct?.product_name}</span> currently has{' '}
            <span className="font-black font-mono">{selectedProduct?.current_stock}</span> units in stock.
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Add Quantity ({selectedProduct?.unit || 'units'})
            </label>
            <input
              type="number"
              min={1}
              value={restockAddAmount}
              onChange={(e) => setRestockAddAmount(Number(e.target.value))}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 font-mono"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              New Total will become:{' '}
              <span className="font-bold text-slate-900">
                {(selectedProduct?.current_stock || 0) + (restockAddAmount || 0)} {selectedProduct?.unit}
              </span>
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setRestockModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleConfirmRestock}
              disabled={actionLoading}
              className="bg-emerald-700 hover:bg-emerald-800 text-white"
            >
              {actionLoading ? 'Updating Stock...' : 'Confirm Restock'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
