import React, { useState, useEffect } from 'react';
import { Package, Truck, CheckCircle2, Clock, MapPin, ShoppingBag } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { OrderStatusBadge } from '../../components/marketplace/OrderStatusBadge';
import { marketplaceApi } from '../../services/marketplaceApi';
import { Order } from '../../types';
import { formatINR, formatDate } from '../../utils/formatters';

export const CustomerOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadOrders = async () => {
    setIsLoading(true);
    try {
      const data = await marketplaceApi.getMyOrders();
      setOrders(data);
    } catch (err) {
      console.error('Failed to load orders', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-agri-950 text-white rounded-3xl p-6 sm:p-8 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Badge variant="green" size="sm">BUYER ORDERS & HARVEST DISPATCH</Badge>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-2">
            My Direct Farm Orders & Tracking
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Real-time status updates from farm harvest to your doorstep.
          </p>
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {orders.length === 0 ? (
          <Card className="p-12 text-center text-slate-400 space-y-3">
            <Package className="w-12 h-12 mx-auto text-slate-300" />
            <h4 className="font-bold text-slate-700">No Orders Yet</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Browse our fresh harvest marketplace and purchase directly from verified farmers.
            </p>
          </Card>
        ) : (
          orders.map((order) => (
            <Card key={order.id} className="p-6 border-slate-200/90 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-900">Order #{order.order_number}</span>
                    <OrderStatusBadge status={order.status} />
                  </div>
                  <span className="text-xs text-slate-400 mt-0.5 block">Placed on {formatDate(order.created_at)}</span>
                </div>

                <div className="text-left sm:text-right">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Amount</span>
                  <span className="text-xl font-extrabold text-emerald-700">{formatINR(order.total_amount_inr)}</span>
                  <span className="text-xs text-slate-500 font-medium block">Paid via {order.payment_method}</span>
                </div>
              </div>

              {/* Order Items Table */}
              <div className="space-y-2">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Harvested Produce:</span>
                <div className="space-y-2">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl text-xs">
                      <div>
                        <strong className="text-slate-900">{item.crop_name}</strong>
                        <span className="text-slate-500 ml-2">Qty: {item.quantity} {item.unit}</span>
                      </div>
                      <span className="font-mono font-bold text-slate-800">{formatINR(item.total_price || item.subtotal_inr || 0)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Delivery Details */}
              <div className="p-3.5 bg-slate-50 rounded-2xl flex items-start gap-2 text-xs text-slate-600">
                <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-800">Delivering to:</strong> {order.delivery_contact_name} ({order.delivery_contact_phone})
                  <div className="text-slate-500">{order.delivery_address}, {order.delivery_city}, {order.delivery_pincode}</div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
