import React from 'react';
import { ShoppingBag, PackageCheck, CheckCircle2, MapPin } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { formatINR } from '../../utils/formatters';

export const ShopOrders: React.FC = () => {
  const storeOrders = [
    {
      id: 'SO-901',
      customer: 'Rajesh Kumar (Farmer)',
      items: 'Urea (45kg Bag) × 4, Bio-Organic Liquid Potash × 2',
      total: 1972,
      status: 'READY_FOR_PICKUP',
      date: 'Today, 10:30 AM',
    },
    {
      id: 'SO-902',
      customer: 'Manpreet Singh (Farmer)',
      items: 'Tomato Hybrid Seed (Abhinav US-440) × 3',
      total: 2460,
      status: 'FULFILLED',
      date: 'Yesterday',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Store Pickup & Counter Orders
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Orders placed by local farmers for in-store pickup and doorstep delivery.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {storeOrders.map((o) => (
          <Card key={o.id} className="p-6 border-slate-200/90 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <strong className="text-slate-900 text-sm">Order #{o.id}</strong>
                <Badge variant={o.status === 'FULFILLED' ? 'green' : 'amber'} size="sm">
                  {o.status}
                </Badge>
              </div>
              <span className="font-extrabold text-emerald-700 text-base">{formatINR(o.total)}</span>
            </div>

            <div className="text-xs space-y-1 text-slate-600">
              <p><strong className="text-slate-800">Customer:</strong> {o.customer}</p>
              <p><strong className="text-slate-800">Items:</strong> {o.items}</p>
              <p className="text-slate-400">Placed: {o.date}</p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
