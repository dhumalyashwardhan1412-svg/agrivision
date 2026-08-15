import React, { useState, useEffect } from 'react';
import { TrendingUp, Plus, Check, RefreshCw } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { marketApi } from '../../services/marketApi';
import { MarketPrice } from '../../types';
import { formatINR } from '../../utils/formatters';

export const MarketPriceModeration: React.FC = () => {
  const [prices, setPrices] = useState<MarketPrice[]>([]);

  const loadPrices = async () => {
    try {
      const data = await marketApi.getPrices();
      setPrices(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadPrices();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Mandi Price Feeds & Agmarknet Sync
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Audit live market feeds and verify wholesale data integrity.
          </p>
        </div>
      </div>

      <Card className="p-6">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100 uppercase text-[10px]">
              <tr>
                <th className="py-3 px-4">Commodity</th>
                <th className="py-3 px-4">Mandi Market</th>
                <th className="py-3 px-4">State</th>
                <th className="py-3 px-4">Modal Price (₹/Qtl)</th>
                <th className="py-3 px-4">Per kg</th>
                <th className="py-3 px-4">Data Source Tag</th>
                <th className="py-3 px-4">Last Verified</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {prices.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/80 transition">
                  <td className="py-3.5 px-4 font-bold text-slate-900">{p.commodity}</td>
                  <td className="py-3.5 px-4">{p.market_name}</td>
                  <td className="py-3.5 px-4">{p.state}</td>
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900">₹{p.modal_price_per_quintal}</td>
                  <td className="py-3.5 px-4 font-mono font-extrabold text-emerald-700">₹{p.price_per_kg}/kg</td>
                  <td className="py-3.5 px-4">
                    <Badge variant={p.data_type === 'LIVE' ? 'green' : 'amber'} size="sm">
                      {p.data_type} DATA
                    </Badge>
                  </td>
                  <td className="py-3.5 px-4 text-slate-400">{p.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
