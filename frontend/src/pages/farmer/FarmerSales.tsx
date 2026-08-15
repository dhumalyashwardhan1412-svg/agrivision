import React, { useState, useEffect } from 'react';
import { ShoppingBag, Plus, PackageCheck, Truck, CheckCircle2, User, Phone, MapPin, Trash2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Tabs } from '../../components/ui/Tabs';
import { OrderStatusBadge } from '../../components/marketplace/OrderStatusBadge';
import { CreateListingModal } from '../../components/marketplace/CreateListingModal';
import { marketplaceApi } from '../../services/marketplaceApi';
import { CropListing, Order, OrderStatus } from '../../types';
import { formatINR, formatDate } from '../../utils/formatters';

export const FarmerSales: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'ORDERS' | 'LISTINGS'>('ORDERS');
  const [listings, setListings] = useState<CropListing[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [myListings, myOrders] = await Promise.all([
        marketplaceApi.getMyListings(),
        marketplaceApi.getFarmerOrders(),
      ]);
      setListings(myListings);
      setOrders(myOrders);
    } catch (err) {
      console.error('Failed to load farmer sales data', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUpdateStatus = async (orderId: number, nextStatus: OrderStatus) => {
    try {
      await marketplaceApi.updateOrderStatus(orderId, nextStatus);
      await loadData();
    } catch (err) {
      console.error('Failed to update status', err);
      alert('Status update failed.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-agri-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Badge variant="green" size="sm">DIRECT FARM COMMERCE ENGINE</Badge>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-2">
            Produce Sales & Buyer Orders
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Sell directly to wholesale buyers and end consumers at 0% commission.
          </p>
        </div>

        <Button
          variant="secondary"
          icon={Plus}
          onClick={() => setIsCreateModalOpen(true)}
        >
          Publish Harvest Listing
        </Button>
      </div>

      {/* Mode Tabs */}
      <Tabs
        tabs={[
          { id: 'ORDERS', label: `Customer Orders Received (${orders.length})`, icon: PackageCheck },
          { id: 'LISTINGS', label: `My Active Produce Listings (${listings.length})`, icon: ShoppingBag },
        ]}
        activeTab={activeTab}
        onChange={(id) => setActiveTab(id as 'ORDERS' | 'LISTINGS')}
      />

      {/* Orders Tab */}
      {activeTab === 'ORDERS' ? (
        <div className="space-y-4">
          {orders.length === 0 ? (
            <Card className="p-12 text-center text-slate-400 space-y-3">
              <PackageCheck className="w-12 h-12 mx-auto text-slate-300" />
              <h4 className="font-bold text-slate-700">No Orders Received Yet</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Once buyers order your listed produce, delivery requests and payments will appear here.
              </p>
            </Card>
          ) : (
            orders.map((ord) => (
              <Card key={ord.id} className="p-6 border-slate-200/90 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-500">Order #{ord.order_number}</span>
                      <OrderStatusBadge status={ord.status} />
                    </div>
                    <span className="text-xs text-slate-400 mt-0.5 block">Placed on {formatDate(ord.created_at)}</span>
                  </div>

                  <div className="text-left sm:text-right">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Payout</span>
                    <span className="text-xl font-extrabold text-emerald-700">{formatINR(ord.total_amount_inr)}</span>
                  </div>
                </div>

                {/* Items & Buyer Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-2 p-3.5 bg-slate-50 rounded-2xl">
                    <span className="font-bold text-slate-800 uppercase text-[10px] block">Order Items:</span>
                    {ord.items.map((item) => (
                      <div key={item.id} className="flex justify-between items-center text-slate-700 font-semibold">
                        <span>{item.crop_name} × {item.quantity} {item.unit}</span>
                        <span className="font-mono">{formatINR(item.total_price || item.subtotal_inr || 0)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-1.5 p-3.5 bg-slate-50 rounded-2xl">
                    <span className="font-bold text-slate-800 uppercase text-[10px] block">Delivery & Buyer:</span>
                    <p className="font-bold text-slate-900">{ord.delivery_contact_name} ({ord.delivery_contact_phone})</p>
                    <p className="text-slate-600 flex items-start gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                      <span>{ord.delivery_address}, {ord.delivery_city}, {ord.delivery_pincode}</span>
                    </p>
                  </div>
                </div>

                {/* Order Status Action Controls */}
                <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <span className="text-slate-500 font-medium">Update Order State:</span>
                  <div className="flex flex-wrap gap-2">
                    {ord.status === 'PENDING' && (
                      <Button
                        size="sm"
                        variant="primary"
                        icon={CheckCircle2}
                        onClick={() => handleUpdateStatus(ord.id, 'CONFIRMED')}
                      >
                        Accept & Confirm Order
                      </Button>
                    )}
                    {ord.status === 'CONFIRMED' && (
                      <Button
                        size="sm"
                        variant="secondary"
                        icon={PackageCheck}
                        onClick={() => handleUpdateStatus(ord.id, 'PACKED')}
                      >
                        Mark as Harvested & Packed
                      </Button>
                    )}
                    {ord.status === 'PACKED' && (
                      <Button
                        size="sm"
                        variant="amber"
                        icon={Truck}
                        onClick={() => handleUpdateStatus(ord.id, 'IN_TRANSIT')}
                      >
                        Dispatch / In Transit
                      </Button>
                    )}
                    {ord.status === 'IN_TRANSIT' && (
                      <Button
                        size="sm"
                        variant="primary"
                        icon={CheckCircle2}
                        onClick={() => handleUpdateStatus(ord.id, 'DELIVERED')}
                      >
                        Mark as Delivered
                      </Button>
                    )}
                    {ord.status === 'DELIVERED' && (
                      <span className="font-bold text-emerald-700 flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" /> Order Complete & Paid
                      </span>
                    )}
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      ) : (
        /* Listings Tab */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map((item) => (
            <Card key={item.id} className="p-0 overflow-hidden flex flex-col justify-between border-slate-200/90">
              <div className="relative h-44 bg-slate-100">
                <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
                <div className="absolute top-3 left-3">
                  {item.is_organic && <Badge variant="green" size="sm">ORGANIC</Badge>}
                </div>
              </div>

              <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 text-base">{item.title}</h4>
                  <p className="text-xs text-slate-500 line-clamp-2 mt-1">{item.description}</p>
                  <div className="mt-2 text-xs font-semibold text-slate-600 flex justify-between">
                    <span>Available Stock:</span>
                    <strong className="text-slate-900">{item.quantity_available} {item.unit}</strong>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-base font-extrabold text-agri-800">{formatINR(item.price_per_unit)}/{item.unit}</span>
                  <Badge variant={item.status === 'ACTIVE' ? 'green' : 'slate'} size="sm">
                    {item.status}
                  </Badge>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create Listing Modal */}
      <CreateListingModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onListingCreated={(newListing) => {
          setListings((prev) => [newListing, ...prev]);
          setActiveTab('LISTINGS');
        }}
      />
    </div>
  );
};
