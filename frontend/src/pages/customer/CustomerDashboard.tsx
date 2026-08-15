import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Package, Truck, Heart, ArrowRight, ShieldCheck, Star } from 'lucide-react';
import { StatCard } from '../../components/dashboard/StatCard';
import { Card, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { OrderStatusBadge } from '../../components/marketplace/OrderStatusBadge';
import { marketplaceApi } from '../../services/marketplaceApi';
import { Order, CropListing } from '../../types';
import { formatINR } from '../../utils/formatters';

export const CustomerDashboard: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [featured, setFeatured] = useState<CropListing[]>([]);

  useEffect(() => {
    const init = async () => {
      try {
        const [ord, list] = await Promise.all([
          marketplaceApi.getMyOrders(),
          marketplaceApi.getListings(),
        ]);
        setOrders(ord);
        setFeatured(list.slice(0, 3));
      } catch (err) {
        console.error(err);
      }
    };
    init();
  }, []);

  const totalSpent = orders.reduce((sum, o) => sum + o.total_amount_inr, 0);

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-agri-950 text-white rounded-3xl p-6 sm:p-8 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Badge variant="green" size="sm">BUYER OVERVIEW</Badge>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-2">
            Welcome to Direct Farm Commerce
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Access 100% verified farm harvests, zero middleman markup, and farm-to-table deliveries.
          </p>
        </div>

        <Link to="/marketplace">
          <Button variant="secondary" icon={ShoppingBag}>
            Explore Produce Marketplace
          </Button>
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Total Orders Placed"
          value={orders.length.toString()}
          subtitle="Direct from farms"
          icon={Package}
          color="green"
        />
        <StatCard
          title="Total Spend"
          value={formatINR(totalSpent)}
          subtitle="Saved ~18% vs retail prices"
          icon={ShoppingBag}
          color="blue"
        />
        <StatCard
          title="Active Deliveries"
          value={orders.filter((o) => o.status === 'IN_TRANSIT' || o.status === 'CONFIRMED').length.toString()}
          subtitle="On schedule"
          icon={Truck}
          color="amber"
        />
      </div>

      {/* Recent Orders Overview */}
      <Card className="p-6">
        <CardHeader>
          <div>
            <CardTitle className="text-base">Recent Produce Orders</CardTitle>
            <CardDescription>Status and tracking for your recent farm purchases</CardDescription>
          </div>
          <Link to="/customer/orders">
            <Button variant="ghost" size="sm" icon={ArrowRight} iconPosition="right">
              View All Orders
            </Button>
          </Link>
        </CardHeader>

        {orders.length === 0 ? (
          <div className="text-center py-6 text-slate-400 text-xs">
            No orders placed yet. Visit the marketplace to buy fresh produce.
          </div>
        ) : (
          <div className="space-y-3">
            {orders.slice(0, 3).map((o) => (
              <div key={o.id} className="p-4 bg-slate-50 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <strong className="text-slate-900">Order #{o.order_number}</strong>
                    <OrderStatusBadge status={o.status} />
                  </div>
                  <span className="text-slate-500 mt-0.5 block">{o.items.map((i) => `${i.crop_name} (${i.quantity} ${i.unit})`).join(', ')}</span>
                </div>
                <div className="text-left sm:text-right">
                  <span className="font-extrabold text-sm text-emerald-700">{formatINR(o.total_amount_inr)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};
