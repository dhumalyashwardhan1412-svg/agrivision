import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Search, Filter, Compass, ArrowRight, ShieldCheck, DollarSign } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { MarketTrendChart } from '../../components/charts/MarketTrendChart';
import { marketApi } from '../../services/marketApi';
import { MarketPrice, MarketTrend, MarketComparisonResponse } from '../../types';
import { formatINR } from '../../utils/formatters';

export const MarketIntelligence: React.FC = () => {
  const [prices, setPrices] = useState<MarketPrice[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCommodity, setSelectedCommodity] = useState('Tomato');
  const [trend, setTrend] = useState<MarketTrend | null>(null);
  const [comparison, setComparison] = useState<MarketComparisonResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const loadMarketData = async () => {
    setIsLoading(true);
    try {
      const priceList = await marketApi.getPrices();
      setPrices(priceList);

      const trendData = await marketApi.getTrends(selectedCommodity);
      setTrend(trendData);

      const compData = await marketApi.compareMarkets(selectedCommodity);
      setComparison(compData);
    } catch (err) {
      console.error('Market intelligence error', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMarketData();
  }, [selectedCommodity]);

  const filteredPrices = prices.filter((p) =>
    p.commodity.toLowerCase().includes(search.toLowerCase()) ||
    p.market_name.toLowerCase().includes(search.toLowerCase()) ||
    p.state.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-agri-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Badge variant="blue" size="sm">AGMARKNET APMC MANDI INTELLIGENCE</Badge>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-2">
            Real-Time Agricultural Market Prices & Trends
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Track daily wholesale arrivals, price spread across mandis, and 15-day price momentum forecasts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {['Tomato', 'Wheat', 'Onion', 'Basmati Rice', 'Mustard'].map((c) => (
            <button
              key={c}
              onClick={() => setSelectedCommodity(c)}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition ${
                selectedCommodity === c
                  ? 'bg-emerald-500 text-slate-950 shadow-md'
                  : 'bg-white/10 text-slate-300 hover:bg-white/20'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* 30-Day Trend Chart & Mandi Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8">
          <Card className="p-6 space-y-4">
            <CardHeader>
              <div>
                <Badge variant="green" size="sm">PRICE MOMENTUM FORECAST</Badge>
                <CardTitle className="mt-1">{selectedCommodity} 30-Day Price Trend & Forecast</CardTitle>
                <CardDescription>Historical APMC modal rates with moving average curve</CardDescription>
              </div>
              {trend && (
                <span className="px-3 py-1 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-xl border border-emerald-200">
                  {trend.trend_direction}
                </span>
              )}
            </CardHeader>

            {trend ? (
              <MarketTrendChart data={trend.historical_30d_points} commodityName={selectedCommodity} />
            ) : (
              <div className="h-64 flex items-center justify-center text-slate-400 text-xs">
                Loading price curve...
              </div>
            )}

            {trend && (
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <span className="font-bold text-slate-800 block">💡 Selling Recommendation:</span>
                  <p className="text-slate-600 font-medium">{trend.selling_recommendation}</p>
                </div>
                <div className="text-left sm:text-right shrink-0">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">15-Day Target Rate</span>
                  <span className="text-base font-extrabold text-emerald-700">₹{trend.forecast_next_15d_price} / Qtl</span>
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Mandi Spread Card */}
        <div className="lg:col-span-4">
          <Card className="p-6 h-full flex flex-col justify-between space-y-4">
            <CardHeader>
              <div>
                <CardTitle className="text-base">Mandi Spread Matrix</CardTitle>
                <CardDescription>Inter-state wholesale comparison</CardDescription>
              </div>
            </CardHeader>

            {comparison && (
              <div className="space-y-4 text-xs">
                <div className="p-3.5 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl">
                  <span className="text-[10px] uppercase font-bold text-emerald-800 block">Highest Rate Mandi</span>
                  <span className="text-base font-extrabold text-emerald-900 mt-0.5 block">{comparison.highest_price_market}</span>
                </div>

                <div className="p-3.5 bg-rose-50/70 border border-rose-200/80 rounded-2xl">
                  <span className="text-[10px] uppercase font-bold text-rose-800 block">Lowest Rate Mandi</span>
                  <span className="text-base font-extrabold text-rose-900 mt-0.5 block">{comparison.lowest_price_market}</span>
                </div>

                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-1">
                  <div className="flex justify-between font-medium text-slate-600">
                    <span>Average Wholesale Rate:</span>
                    <strong className="text-slate-900">₹{comparison.average_price_per_kg}/kg</strong>
                  </div>
                  <div className="flex justify-between font-medium text-slate-600">
                    <span>Price Spread:</span>
                    <strong className="text-slate-900">₹{comparison.price_spread_per_quintal}/Qtl</strong>
                  </div>
                </div>
              </div>
            )}

            <div className="p-3 bg-amber-50 rounded-xl text-[11px] text-amber-900 border border-amber-200/80">
              ⚡ <strong>Direct Selling Tip:</strong> Listing on AgriVision Marketplace can save 15-20% in mandi commission and freight deduction.
            </div>
          </Card>
        </div>
      </div>

      {/* Searchable Mandi Prices Table */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <CardTitle className="text-lg">Live Mandi Records ({filteredPrices.length})</CardTitle>
            <CardDescription>Daily verified APMC mandi rates across states</CardDescription>
          </div>
          <div className="w-full sm:w-72">
            <Input
              icon={Search}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search commodity, market, state..."
            />
          </div>
        </div>

        <div className="overflow-x-auto mt-4">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100 uppercase text-[10px]">
              <tr>
                <th className="py-3 px-4">Commodity</th>
                <th className="py-3 px-4">Market / Mandi</th>
                <th className="py-3 px-4">State</th>
                <th className="py-3 px-4">Min Price</th>
                <th className="py-3 px-4">Max Price</th>
                <th className="py-3 px-4">Modal Price (₹/Qtl)</th>
                <th className="py-3 px-4">Price / kg</th>
                <th className="py-3 px-4">7D Trend</th>
                <th className="py-3 px-4">Data Type</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredPrices.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/80 transition">
                  <td className="py-3.5 px-4 font-bold text-slate-900">{p.commodity}</td>
                  <td className="py-3.5 px-4">{p.market_name}</td>
                  <td className="py-3.5 px-4">{p.state}</td>
                  <td className="py-3.5 px-4 font-mono text-slate-500">₹{p.min_price_per_quintal}</td>
                  <td className="py-3.5 px-4 font-mono text-slate-500">₹{p.max_price_per_quintal}</td>
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900">₹{p.modal_price_per_quintal}</td>
                  <td className="py-3.5 px-4 font-mono font-extrabold text-emerald-700">₹{p.price_per_kg}/kg</td>
                  <td className="py-3.5 px-4">
                    <span className={`font-bold ${p.price_change_7d_percent >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {p.price_change_7d_percent >= 0 ? '+' : ''}{p.price_change_7d_percent}%
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <Badge variant={p.data_type === 'LIVE' ? 'green' : 'slate'} size="sm">
                      {p.data_type}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
